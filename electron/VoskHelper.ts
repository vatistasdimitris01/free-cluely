import fs from "fs";
import path from "path";
import { app } from "electron";

// Note: Vosk will be loaded dynamically to avoid issues with ffi-napi during build
let Model: any;
let Recognizer: any;

export class VoskHelper {
  private model: any = null;
  private recognizer: any = null;
  private currentLanguage: "en" | "el" = "en";
  private modelsPath: string;

  constructor() {
    this.modelsPath = path.join(app.getPath("userData"), "vosk-models");
    if (!fs.existsSync(this.modelsPath)) {
      fs.mkdirSync(this.modelsPath, { recursive: true });
    }
  }

  private async loadVosk() {
    if (!Model) {
      const vosk = await import("vosk");
      Model = vosk.Model;
      Recognizer = vosk.Recognizer;
    }
  }

  async initialize(lang: "en" | "el" = "en") {
    try {
      await this.loadVosk();
      
      const modelDir = lang === "en" ? "vosk-model-small-en-us-0.15" : "vosk-model-small-el-0.22";
      const modelPath = path.join(this.modelsPath, modelDir);

      if (!fs.existsSync(modelPath)) {
        console.error(`Vosk model not found at ${modelPath}. Please download it.`);
        return false;
      }

      if (this.model && this.currentLanguage === lang) return true;

      this.model = new Model(modelPath);
      this.recognizer = new Recognizer({ model: this.model, sampleRate: 16000 });
      this.currentLanguage = lang;
      
      console.log(`Vosk ${lang} model initialized.`);
      return true;
    } catch (error) {
      console.error("Failed to initialize Vosk:", error);
      return false;
    }
  }

  processAudio(pcmBuffer: Buffer) {
    if (!this.recognizer) return null;

    if (this.recognizer.acceptWaveform(pcmBuffer)) {
      const result = this.recognizer.result();
      return { type: "final", text: result.text };
    } else {
      const partial = this.recognizer.partialResult();
      return { type: "partial", text: partial.partial };
    }
  }

  setLanguage(lang: "en" | "el") {
    if (this.currentLanguage !== lang) {
      return this.initialize(lang);
    }
    return Promise.resolve(true);
  }
}

export const voskHelper = new VoskHelper();
