import { Client, handle_file } from "@gradio/client";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_DIR = path.join(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

class GradioService {
  constructor() {
    this.client = null;
  }

  getSpaceUrl() {
    return process.env.GRADIO_SPACE_URL || "sharkthak/VeAg-Rice";
  }

  getHfToken() {
    return process.env.HF_TOKEN || process.env.HUGGING_FACE_HUB_TOKEN || '';
  }

  getConnectOptions() {
    const hfToken = this.getHfToken();

    if (!hfToken) {
      return {};
    }

    return { token: hfToken };
  }

  async connect() {
    if (!this.client) {
      const spaceUrl = this.getSpaceUrl();
      // console.log('Connecting to Gradio space:', spaceUrl);
      this.client = await Client.connect(spaceUrl, this.getConnectOptions());
      // console.log('Successfully connected to Gradio space');
    }
    return this.client;
  }

  async downloadImage(imageUrl, filename) {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const filePath = path.join(TEMP_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  }

  cleanupFiles(filePaths) {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          // console.log('Cleaned up file:', filePath);
        }
      } catch (error) {
        // console.error('Error cleaning up file:', filePath, error);
      }
    });
  }

  async processCase(images) {
    const downloadedFiles = [];
    
    try {
      await this.connect();

      // Download all images from Cloudinary to local temp
      // console.log('Downloading images from Cloudinary...');
      const fileHandles = [];
      for (let index = 0; index < images.length; index++) {
        const image = images[index];
        const filename = `temp_image_${Date.now()}_${index}.jpg`;
        const filePath = await this.downloadImage(image.url, filename);
        downloadedFiles.push(filePath);
        fileHandles.push(handle_file(filePath));
      }

      // console.log('Running inference with Gradio API...');
      const result = await this.client.predict("/run_inference", {
        files: fileHandles,
        model_choice: "Best Overall",
        weights_text: "",
        mode: "weighted"
      });

      // console.log('Inference completed successfully');

      // Clean up downloaded files
      this.cleanupFiles(downloadedFiles);

      // Extract disease status from result[7]
      const diseaseStatus = result.data[7] || 'Unknown';

      return {
        success: true,
        diseaseStatus,
        fullResponse: result.data
      };
    } catch (error) {
      // console.error('Error processing case with Gradio:', error);
      
      // Clean up files even on error
      this.cleanupFiles(downloadedFiles);

      return {
        success: false,
        error: error.message || 'Failed to process images'
      };
    }
  }
}

export default new GradioService();
