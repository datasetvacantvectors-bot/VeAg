#import spaces #Write this in the requirements.txt file if you are hosting the model on Hugging Face Spaces ZeroGPU, not required if you are hosting the model on Hugging Face Spaces with CPU.
import os
from pathlib import Path
from datetime import datetime
import json
import requests

import gradio as gr
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

from src import model_handler, predict

DEBUG = True
Path("models/checkpoints").mkdir(parents=True, exist_ok=True)
Path("logs/predictions").mkdir(parents=True, exist_ok=True)
Path("logs/gemini").mkdir(parents=True, exist_ok=True)

def _get_device():
    import torch
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")

def _parse_weights(s: str):
    if not s:
        return None
    try:
        parts = [float(x) for x in s.split(",")]
        ssum = sum(parts) or 1.0
        parts = [x / ssum for x in parts]
        if len(parts) != 3:
            return None
        return parts
    except Exception as e:
        if DEBUG: print(f"[DEBUG] parse_weights error: {e}")
        return None

def _first_image_prob_plot(df: pd.DataFrame):
    if df is None or df.empty:
        fig, ax = plt.subplots(figsize=(5, 3))
        ax.text(0.5, 0.5, "No predictions", ha="center", va="center")
        ax.axis("off")
        return fig

    row = df.iloc[0]
    cols = [c for c in df.columns if c.startswith("prob_")]
    if not cols:
        fig, ax = plt.subplots(figsize=(5, 3))
        ax.text(0.5, 0.5, "No probability columns", ha="center", va="center")
        ax.axis("off")
        return fig

    labels = [c.replace("prob_", "") for c in cols]
    vals = row[cols].astype(float).values
    order = vals.argsort()[::-1]
    labels = [labels[i] for i in order]
    vals = vals[order]

    fig, ax = plt.subplots(figsize=(6, 3.5))
    ax.barh(labels[::-1], vals[::-1], color="#4C78A8")
    ax.set_xlim(0, 1.0)
    ax.set_xlabel("Probability")
    ax.set_title(f"Top probabilities for: {Path(row['filepath']).name}")
    for i, v in enumerate(vals[::-1]):
        ax.text(v + 0.01, i, f"{v:.3f}", va="center")
    fig.tight_layout()
    return fig

def top_n_prob_pie(df: pd.DataFrame, n=3):
    if df is None or df.empty:
        return None
    row = df.iloc[0]
    prob_cols = [c for c in df.columns if c.startswith("prob_")]
    labels = [c.replace("prob_", "") for c in prob_cols]
    values = row[prob_cols].astype(float).values
    top_idx = values.argsort()[::-1][:n]
    top_labels = [labels[i] for i in top_idx]
    top_values = [values[i] for i in top_idx]

    fig, ax = plt.subplots(figsize=(6, 7))
    ax.pie(top_values, labels=top_labels, autopct="%1.1f%%", startangle=140, colors=plt.cm.Set3.colors)
    ax.set_title("Top Predictions Distribution")
    return fig

def prediction_confidence_gauge(df: pd.DataFrame):
    if df is None or df.empty:
        return None

    row = df.iloc[0]
    prob_cols = [c for c in df.columns if c.startswith("prob_")]
    values = row[prob_cols].astype(float).values
    max_val = values.max() 

    theta = np.linspace(-np.pi/2, np.pi/2, 100)
    fig, ax = plt.subplots(figsize=(5, 3), subplot_kw={'projection': 'polar'})
    ax.set_theta_zero_location('S') 
    ax.set_theta_direction(-1) 

    ax.set_yticklabels([])
    ax.set_xticklabels([])
    ax.set_yticks([])
    ax.set_xticks([])

    thresholds = [0.33, 0.66, 1.0]
    colors = ['red', 'yellow', 'green']
    start = -np.pi/2
    for i, t in enumerate(thresholds):
        end = -np.pi/2 + t * np.pi
        ax.barh(1, width=end-start, left=start, height=1.5, color=colors[i], alpha=0.3, edgecolor='k')
        start = end

    needle_angle = -np.pi/2 + max_val * np.pi
    ax.arrow(needle_angle, 0, 0, 1.5, width=0.03, head_width=0.1, head_length=0.2, fc='black', ec='black')

    ax.text(-np.pi/3, 1.8, "Low", ha='center', va='center', fontsize=10, fontweight='bold')
    ax.text(0, 1.9, "Medium", ha='center', va='center', fontsize=10, fontweight='bold')
    ax.text(np.pi/3, 1.8, "High", ha='center', va='center', fontsize=10, fontweight='bold')

    ax.set_title(f"Prediction Confidence: {max_val:.2f}", va='bottom', fontsize=12, fontweight='bold')

    return fig


def get_gemini_advice(disease_name: str):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or disease_name.lower() == "healthy":
        return '{"causes": [], "treatment": [], "prevention": []}', None 

    prompt = (
        f"Rice leaf disease: {disease_name}.\n"
        "Provide treatment advice, causes, and preventive measures in JSON format:\n"
        '{"causes": [...], "treatment": [...], "prevention": [...]}'
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gemini-2.5-flash",
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        text_output = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")

        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file_txt = Path(f"logs/gemini/gemini_{disease_name}_{ts}.txt")
        with open(log_file_txt, "w", encoding="utf-8") as f:
            f.write(f"Prompt:\n{prompt}\n\nResponse:\n{text_output}")
        if DEBUG: print(f"[DEBUG] Gemini response logged to {log_file_txt}")

        # Save CSV automatically if valid JSON
        try:
            advice_json = json.loads(text_output)
            df_csv = pd.DataFrame({
                "Causes": advice_json.get("causes", []),
                "Treatment": advice_json.get("treatment", []),
                "Prevention": advice_json.get("prevention", [])
            })
            csv_path = Path(f"logs/gemini/gemini_{disease_name}_{ts}.csv")
            df_csv.to_csv(csv_path, index=False)
            if DEBUG: print(f"[DEBUG] Gemini advice CSV saved to {csv_path}")
        except Exception:
            pass

        return text_output, None
    except Exception as e:
        return f'Error calling Gemini API: {str(e)}', None

#@spaces.GPU #Write this in the requirements.txt file if you are hosting the model on Hugging Face Spaces ZeroGPU, not required if you are hosting the model on Hugging Face Spaces with CPU.
def run_inference(files, model_choice, weights_text, mode):
    if not files:
        return None, None, pd.DataFrame(), None, "No files uploaded.", "", "Healthy"

    device = _get_device()
    paths = [f.name if hasattr(f, "name") else f for f in files]
    weights = _parse_weights(weights_text) if model_choice.startswith("Ensemble") else None

    try:
        if model_choice == "Best Overall":
            df, meta = predict.predict_best_overall(paths, device=device, classes_path="classes.json")
        elif model_choice in ["ConvNeXt-Base", "EfficientNetV2-M", "DeiT-Small"]:
            df, meta = predict.predict_arch(model_choice, paths, device=device, classes_path="classes.json")
        elif model_choice == "Ensemble":
            df, meta = predict.predict_ensemble(
                paths, device=device, weights=weights, mode=mode,
                classes_path="classes.json", logits_fusion=False
            )
        else:
            df, meta = predict.predict_ensemble(
                paths, device=device, weights=weights, mode=mode,
                classes_path="classes.json", logits_fusion=True
            )
    except Exception as e:
        return None, None, pd.DataFrame(), None, f"Error: {str(e)}", "", "Healthy"

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_csv = Path("logs/predictions") / f"preds_{model_choice.replace(' ', '_').lower()}_{ts}.csv"
    df.to_csv(out_csv, index=False)
    if DEBUG: print(f"[DEBUG] Prediction CSV saved to {out_csv}")

    gallery = paths
    prob_plot = _first_image_prob_plot(df)
    pie_chart = top_n_prob_pie(df)
    confidence_gauge = prediction_confidence_gauge(df)
    summary = f"Model selection: {model_choice}\nMeta: {meta}\nSaved CSV: {out_csv}"

    top_prob_cols = [c for c in df.columns if c.startswith("prob_")]
    top_idx = df[top_prob_cols].iloc[0].astype(float).values.argmax()
    top_label = top_prob_cols[top_idx].replace("prob_", "")
    disease_status = "Healthy" if top_label.lower() == "healthy" else top_label

    return gallery, prob_plot, pie_chart, confidence_gauge, df, str(out_csv), summary, disease_status, top_label

def get_treatment_advice(disease_name):
    text, _ = get_gemini_advice(disease_name)
    return text

# --- Gradio UI ---
with gr.Blocks(title="VeAg: Vacant Vectors Model", theme=gr.themes.Soft()) as demo:
    gr.Markdown(
        """
        <div style="text-align:center">
            <h1>VeAg by Vacant Vectors: Rice Leaf Disease Detection & Treatment Advice Model</h1>
            <p style="font-size:16px;">Upload Rice leaf images and choose a model to get predictions.</p>
            <p style="font-size:16px;">Disclaimer: This tool provides automated rice leaf disease predictions and treatment suggestions for educational and informational purposes only. It is not a substitute for professional agricultural advice for now.</p>
        </div>
        """
    )

    with gr.Row():
        with gr.Column(scale=1):
            gr.Markdown("### Inputs")
            files_u = gr.Files(label="Upload images", file_count="multiple", type="filepath")
            model_choice = gr.Dropdown(
                label="Model",
                choices=[
                    "Best Overall",
                    "ConvNeXt-Base",
                    "EfficientNetV2-M",
                    "DeiT-Small",
                    "Ensemble",
                    "Ensemble (logits)"
                ],
                value="Best Overall"
            )
            weights_text = gr.Textbox(
                label="Ensemble Weights (comma-separated, optional)",
                placeholder="0.45,0.10,0.45"
            )
            mode = gr.Dropdown(
                label="Ensemble Mode",
                choices=["average", "weighted"],
                value="weighted"
            )
            btn_predict = gr.Button("Predict", variant="primary")
            btn_gemini = gr.Button("Get Treatment Advice", variant="secondary")

        with gr.Column(scale=2):
            gr.Markdown("### Preview and Results")
            gallery = gr.Gallery(label="Uploaded Images", show_label=True)
            prob_plot = gr.Plot(label="Probability Bar Chart (first image)")
            pie_chart = gr.Plot(label="Top-N Predictions Pie Chart")
            confidence_gauge = gr.Plot(label="Prediction Confidence Gauge")
            out_df = gr.Dataframe(label="Predictions")
            out_file = gr.File(label="Download Predictions CSV")
            out_txt = gr.Textbox(label="Summary", lines=6)
            disease_status = gr.Textbox(label="Disease Status", lines=2)
            gemini_output = gr.Textbox(label="Treatment Advice (JSON)", lines=20)

    btn_predict.click(
        run_inference,
        inputs=[files_u, model_choice, weights_text, mode],
        outputs=[gallery, prob_plot, pie_chart, confidence_gauge, out_df, out_file, out_txt, disease_status, disease_status]
    )

    btn_gemini.click(
        get_treatment_advice,
        inputs=[disease_status],
        outputs=[gemini_output]
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", "7860"))
    demo.launch(server_name="0.0.0.0", server_port=port, pwa=True)
