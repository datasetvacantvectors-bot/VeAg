"""
Model Handler Module for RiceVision Project
Handles model architectures, ensemble logic, loading, and saving
"""

import torch
import torch.nn as nn
import timm
from pathlib import Path
import json
from datetime import datetime

def get_model(model_name, num_classes, pretrained=True):
    """
    Get a pretrained model by name

    Args:
        model_name: One of ['ConvNeXt-Base', 'EfficientNetV2-M', 'DeiT-Small']
        num_classes: Number of output classes
        pretrained: Whether to load pretrained weights

    Returns:
        PyTorch model
    """
    print(f"Creating model: {model_name}")
    print(f"   Num classes: {num_classes}")
    print(f"   Pretrained: {pretrained}")

    if model_name == 'ConvNeXt-Base':
        model = timm.create_model(
            'convnext_base',
            pretrained=pretrained,
            num_classes=num_classes
        )
        print(f"ConvNeXt-Base loaded (88M parameters)")

    elif model_name == 'EfficientNetV2-M':
        model = timm.create_model(
            'tf_efficientnetv2_m',
            pretrained=pretrained,
            num_classes=num_classes
        )
        print(f"EfficientNetV2-M loaded (54M parameters)")

    elif model_name == 'DeiT-Small':
        model = timm.create_model(
            'deit_small_patch16_224',
            pretrained=pretrained,
            num_classes=num_classes
        )
        print(f"DeiT-Small loaded (22M parameters)")

    else:
        raise ValueError(f"Unsupported model name: {model_name}. "
                        f"Choose from ['ConvNeXt-Base', 'EfficientNetV2-M', 'DeiT-Small']")

    return model


def count_parameters(model):
    """Count trainable parameters in a model"""
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)

    return {
        'total': total,
        'trainable': trainable,
        'total_millions': total / 1e6,
        'trainable_millions': trainable / 1e6
    }


def get_model_info(model, model_name):
    """Get comprehensive information about a model"""
    params = count_parameters(model)

    info = {
        'name': model_name,
        'total_parameters': params['total'],
        'trainable_parameters': params['trainable'],
        'total_parameters_M': f"{params['total_millions']:.2f}M",
        'trainable_parameters_M': f"{params['trainable_millions']:.2f}M",
    }

    return info


class EnsembleModel(nn.Module):
    """
    Ensemble of three expert models with weighted averaging
    """
    def __init__(self, model_convnext, model_efficientnet, model_deit,
                 weights=None, mode='average'):
        """
        Args:
            model_convnext: ConvNeXt-Base model
            model_efficientnet: EfficientNetV2-M model
            model_deit: DeiT-Small model
            weights: Optional list of 3 weights for weighted averaging
            mode: 'average' or 'weighted' or 'max'
        """
        super().__init__()

        self.model_convnext = model_convnext
        self.model_efficientnet = model_efficientnet
        self.model_deit = model_deit

        self.mode = mode

        if weights is None:
            self.weights = [1/3, 1/3, 1/3]
        else:
            assert len(weights) == 3, "Must provide exactly 3 weights"
            assert abs(sum(weights) - 1.0) < 1e-6, "Weights must sum to 1.0"
            self.weights = weights

        print(f"🎯 Ensemble created with mode: {mode}")
        print(f"   Weights: ConvNeXt={self.weights[0]:.3f}, "
              f"EfficientNet={self.weights[1]:.3f}, DeiT={self.weights[2]:.3f}")

    def forward(self, x):
        """
        Forward pass through all models and combine predictions
        """
        out_convnext = self.model_convnext(x)
        out_efficientnet = self.model_efficientnet(x)
        out_deit = self.model_deit(x)

        if self.mode == 'average':
            prob_convnext = torch.softmax(out_convnext, dim=1)
            prob_efficientnet = torch.softmax(out_efficientnet, dim=1)
            prob_deit = torch.softmax(out_deit, dim=1)

            out = (prob_convnext + prob_efficientnet + prob_deit) / 3

        elif self.mode == 'weighted':
            prob_convnext = torch.softmax(out_convnext, dim=1)
            prob_efficientnet = torch.softmax(out_efficientnet, dim=1)
            prob_deit = torch.softmax(out_deit, dim=1)

            out = (self.weights[0] * prob_convnext +
                   self.weights[1] * prob_efficientnet +
                   self.weights[2] * prob_deit)

        elif self.mode == 'max':
            prob_convnext = torch.softmax(out_convnext, dim=1)
            prob_efficientnet = torch.softmax(out_efficientnet, dim=1)
            prob_deit = torch.softmax(out_deit, dim=1)

            stacked = torch.stack([prob_convnext, prob_efficientnet, prob_deit])
            out, _ = torch.max(stacked, dim=0)

        else:
            raise ValueError(f"Unsupported ensemble mode: {self.mode}")

        return out

    def get_individual_predictions(self, x):
        """
        Get predictions from each individual model separately
        Returns dict with all predictions
        """
        with torch.no_grad():
            out_convnext = torch.softmax(self.model_convnext(x), dim=1)
            out_efficientnet = torch.softmax(self.model_efficientnet(x), dim=1)
            out_deit = torch.softmax(self.model_deit(x), dim=1)

        return {
            'ConvNeXt-Base': out_convnext,
            'EfficientNetV2-M': out_efficientnet,
            'DeiT-Small': out_deit,
            'Ensemble': self.forward(x)
        }


def create_ensemble(num_classes, pretrained=True, weights=None, mode='average'):
    """
    Create an ensemble of all three expert models

    Args:
        num_classes: Number of output classes
        pretrained: Whether to use pretrained weights
        weights: Optional list of 3 weights for ensemble
        mode: Ensemble combination mode

    Returns:
        EnsembleModel instance
    """
    print("Creating Ensemble Model...")
    print("="*60)

    model_convnext = get_model('ConvNeXt-Base', num_classes, pretrained)
    model_efficientnet = get_model('EfficientNetV2-M', num_classes, pretrained)
    model_deit = get_model('DeiT-Small', num_classes, pretrained)

    ensemble = EnsembleModel(
        model_convnext,
        model_efficientnet,
        model_deit,
        weights=weights,
        mode=mode
    )

    print("="*60)
    print("Ensemble created successfully!")

    total_params = (count_parameters(model_convnext)['total'] +
                   count_parameters(model_efficientnet)['total'] +
                   count_parameters(model_deit)['total'])

    print(f"Total ensemble parameters: {total_params/1e6:.2f}M")

    return ensemble


def save_model(model, model_name, run_name, metadata=None):
    """
    Save model weights and metadata

    Args:
        model: PyTorch model to save
        model_name: Architecture name
        run_name: Unique run identifier
        metadata: Optional dict with additional info

    Returns:
        Path to saved checkpoint
    """
    checkpoint_dir = Path('models/checkpoints')
    checkpoint_dir.mkdir(parents=True, exist_ok=True)

    checkpoint_path = checkpoint_dir / f"{run_name}.pth"

    checkpoint = {
        'model_state_dict': model.state_dict(),
        'model_name': model_name,
        'run_name': run_name,
        'timestamp': datetime.now().isoformat(),
    }

    if metadata:
        checkpoint['metadata'] = metadata

    torch.save(checkpoint, checkpoint_path)

    print(f"Model saved to: {checkpoint_path}")

    return str(checkpoint_path)


def load_model(checkpoint_path, num_classes, device='cpu'):
    """
    Load a saved model

    Args:
        checkpoint_path: Path to the checkpoint file
        num_classes: Number of output classes
        device: Device to load model on

    Returns:
        Loaded model and metadata
    """
    print(f"Loading model from: {checkpoint_path}")

    checkpoint = torch.load(checkpoint_path, map_location=device)

    model_name = checkpoint['model_name']

    model = get_model(model_name, num_classes, pretrained=False)

    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()

    print(f"Model loaded successfully!")
    print(f"   Architecture: {model_name}")
    print(f"   Run: {checkpoint['run_name']}")
    print(f"   Saved: {checkpoint['timestamp'][:19]}")

    metadata = checkpoint.get('metadata', {})

    return model, metadata


def load_ensemble_from_checkpoints(convnext_path, efficientnet_path, deit_path,
                                   num_classes, device='cpu', weights=None, mode='average'):
    """
    Load an ensemble from three separate checkpoint files

    Args:
        convnext_path: Path to ConvNeXt checkpoint
        efficientnet_path: Path to EfficientNetV2 checkpoint
        deit_path: Path to DeiT checkpoint
        num_classes: Number of classes
        device: Device to load on
        weights: Ensemble weights
        mode: Ensemble mode

    Returns:
        EnsembleModel with loaded weights
    """
    print("Loading Ensemble from checkpoints...")
    print("="*60)

    model_convnext, _ = load_model(convnext_path, num_classes, device)
    model_efficientnet, _ = load_model(efficientnet_path, num_classes, device)
    model_deit, _ = load_model(deit_path, num_classes, device)

    ensemble = EnsembleModel(
        model_convnext,
        model_efficientnet,
        model_deit,
        weights=weights,
        mode=mode
    )

    ensemble.to(device)
    ensemble.eval()

    print("="*60)
    print("Ensemble loaded successfully!")

    return ensemble

def compare_models(num_classes=5):
    """
    Compare all three model architectures
    Returns comparison table
    """
    print("Comparing Model Architectures...")
    print("="*60)

    models_info = []

    for model_name in ['ConvNeXt-Base', 'EfficientNetV2-M', 'DeiT-Small']:
        model = get_model(model_name, num_classes, pretrained=False)
        info = get_model_info(model, model_name)
        models_info.append(info)

        print(f"\n{model_name}:")
        print(f"   Total Parameters: {info['total_parameters_M']}")
        print(f"   Trainable Parameters: {info['trainable_parameters_M']}")

    print("\n" + "="*60)

    return models_info

def freeze_backbone(model, freeze=True):
    """
    Freeze or unfreeze the backbone (all layers except the classifier head).
    Supports common timm architectures:
      - ConvNeXt / ViT / DeiT: model.head
      - EfficientNet / MobileNet: model.classifier
      - ResNet variants: model.fc
    """
    if not freeze:
        for p in model.parameters():
            p.requires_grad = True
        trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
        total = sum(p.numel() for p in model.parameters())
        print(f"Backbone unfrozen. Trainable: {trainable/1e6:.2f}M / {total/1e6:.2f}M")
        return

    for p in model.parameters():
        p.requires_grad = False

    classifier_unfrozen = False

    if hasattr(model, 'head') and hasattr(model.head, 'parameters'):

        for p in model.head.parameters():
            p.requires_grad = True
        classifier_unfrozen = True

    if not classifier_unfrozen and hasattr(model, 'classifier') and hasattr(model.classifier, 'parameters'):
        for p in model.classifier.parameters():
            p.requires_grad = True
        classifier_unfrozen = True

    if not classifier_unfrozen and hasattr(model, 'fc') and hasattr(model.fc, 'parameters'):
        for p in model.fc.parameters():
            p.requires_grad = True
        classifier_unfrozen = True

    if not classifier_unfrozen:
        for name, p in model.named_parameters():
            if any(k in name.lower() for k in ['head', 'classifier', 'fc']):
                p.requires_grad = True
                classifier_unfrozen = True

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    if classifier_unfrozen:
        pct = (trainable / total * 100.0) if total > 0 else 0.0
        print(f"Backbone frozen. Trainable: {trainable/1e6:.2f}M / {total/1e6:.2f}M ({pct:.2f}%)")
    else:
        print("WARNING: Could not identify classifier head. All layers remain frozen.")
        print(f"Trainable: {trainable/1e6:.2f}M / {total/1e6:.2f}M")
