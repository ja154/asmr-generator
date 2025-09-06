/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const MOODS = ["Calm", "Cozy", "Mysterious", "Ethereal", "Melancholy", "Dreamy", "Intimate", "Playful", "Futuristic", "Vintage", "Clinical", "Soothing"];
const LIGHTING_STYLES = ["Natural Light (Day)", "Candlelight", "Neon Glow", "Soft Studio Light", "Dim Ambient", "Backlit", "Cinematic", "Moonlight"];

const CAMERA_MOVEMENTS = ["Static", "Slow Pan", "Slow Zoom In", "Slow Zoom Out", "Dolly", "Handheld", "Orbit", "Tracking Shot"];
const CAMERA_ANGLES = ["Eye-level", "Low Angle", "High Angle", "Dutch Angle", "Close-up", "Wide Shot", "Macro", "Point of View (POV)"];
const CAMERA_FOCUS = ["Soft Focus", "Deep Focus", "Rack Focus", "Shallow Depth of Field"];
const VISUAL_EFFECTS = ["Soft Glow", "Fog", "Muted Tones", "Film Grain", "Lens Flare", "Dust Particles", "Bokeh", "Chromatic Aberration", "Light Leaks", "Bloom", "Vignette", "Iridescence", "Translucence"];

const PRIMARY_SOUNDS = ["Tapping", "Crinkling", "White Noise", "Humming", "Brushing", "Liquid Sounds", "Rain", "Fireplace", "Wind", "Ocean Waves", "Forest Ambience", "Keyboard Typing", "None"];
const SECONDARY_SOUNDS = ["Soft Speaking", "Whispering", "Mouth Sounds (inaudible)", "Fabric Rustling", "Wood Creaks", "Thunder", "Birds Chirping", "Pages Turning", "Ticking Clock", "Purring Cat"];
const SOUND_QUALITIES = ["High-Fidelity (Binaural)", "Lo-fi", "Muffled", "Crisp", "Reverberant", "Spacious"];

const ASMR_TRIGGERS = ["Tapping", "Scratching", "Brushing", "Crinkling", "Whispering", "Personal Attention", "Typing", "Liquid Sounds", "Sticky Sounds", "Soft Speaking", "Slicing", "Squishing", "Layered Sounds"];
const CORE_MATERIALS = ["Wood", "Glass", "Metal", "Plastic", "Fabric", "Paper", "Leather", "Stone", "Liquid", "Skin", "Gel", "Silicone", "Foam"];
const PACING_OPTIONS = ["Slow and deliberate", "Rhythmic and repetitive", "Gentle and continuous", "Varied with pauses", "Quick and crisp"];

const initialState = {
  idea: '',
  description: '',
  moods: [],
  lighting: LIGHTING_STYLES[0],
  pacing: PACING_OPTIONS[0],
  sequence: '',
  environment: '',
  subject: '',
  cameraMovement: CAMERA_MOVEMENTS[0],
  cameraAngle: CAMERA_ANGLES[0],
  cameraFocus: CAMERA_FOCUS[0],
  visualEffects: [],
  soundscapePrimary: PRIMARY_SOUNDS[0],
  soundscapeSecondary: [],
  soundscapeQuality: SOUND_QUALITIES[0],
  asmrTriggers: [],
  materials: [],
};

const FormControl = ({ label, children }) => (
  <div className="form-control">
    <label>{label}</label>
    {children}
  </div>
);

const MultiSelectGroup = ({ items, selectedItems, onToggle }) => (
  <div className="multi-select-group">
    {items.map(item => (
      <button
        key={item}
        className={`chip ${selectedItems.includes(item) ? 'active' : ''}`}
        onClick={() => onToggle(item)}
        aria-pressed={selectedItems.includes(item)}
      >
        {item}
      </button>
    ))}
  </div>
);

const SelectControl = ({ value, onChange, options }) => (
  <div className="select-wrapper">
    <select className="select" value={value} onChange={onChange}>
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

export default function App() {
  const [formState, setFormState] = useState(initialState);
  const [generatedJson, setGeneratedJson] = useState(null);
  const [narrativePrompt, setNarrativePrompt] = useState('');
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [validationStatus, setValidationStatus] = useState('unchecked');
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [copyNarrativeButtonText, setCopyNarrativeButtonText] = useState('Copy');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [theme, setTheme] = useState('dark');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const toggleMultiSelect = (item, field) => {
    setFormState(prev => {
      const currentSelection = prev[field];
      const newSelection = currentSelection.includes(item)
        ? currentSelection.filter(i => i !== item)
        : [...currentSelection, item];
      return { ...prev, [field]: newSelection };
    });
  };
  
  const handleImageAnalysis = async (imageDataUrl) => {
    if (!imageDataUrl || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = imageDataUrl.split(',')[1];
      const mimeType = imageDataUrl.match(/data:(.*);/)[1];

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };
      const textPart = {
        text: `Analyze this image from what appears to be an ASMR video. Based on the visual content, generate a short, evocative title (as 'title') and a detailed, sensory-rich paragraph (as 'description') describing the scene. Focus on textures, potential sounds, and the overall atmosphere. This will be used to seed a prompt for an AI video generator.`
      };

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short, evocative, sensory-rich title for an ASMR video based on the image." },
              description: { type: Type.STRING, description: "A detailed paragraph describing the scene from the image, focusing on textures, sounds, and atmosphere." },
            }
          }
        }
      });

      const result = JSON.parse(response.text);
      setFormState(prev => ({
        ...prev,
        idea: result.title || prev.idea,
        description: result.description || ''
      }));

    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageAnalysis(reader.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const handleEnhanceIdea = async () => {
    if (!formState.idea || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Expand this ASMR idea into a richer title and description: "${formState.idea}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short, evocative, sensory-rich title for an ASMR video." },
              description: { type: Type.STRING, description: "A detailed paragraph describing the scene, focusing on textures, sounds, and atmosphere." },
            }
          }
        }
      });

      const result = JSON.parse(response.text);
      setFormState(prev => ({
        ...prev,
        idea: result.title || prev.idea,
        description: result.description || ''
      }));

    } catch (error) {
      console.error("Error enhancing idea:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSuggestSettings = async () => {
    if (!formState.idea || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are an expert ASMR video director. Analyze the following ASMR video concept and suggest the best settings to create a compelling and immersive experience.

**Core Idea:** "${formState.idea}"
**Description:** "${formState.description || 'No description provided.'}"

Based on this, fill out the following fields. For fields with options, choose the most fitting ones from the provided lists in the schema description. For free-text fields, be creative and descriptive. The action sequence should be a few concise, newline-separated steps. Return ONLY a valid JSON object adhering to the schema.`;

      const suggestionSchema = {
        type: Type.OBJECT,
        properties: {
          moods: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Select a few moods from: ${MOODS.join(', ')}` },
          lighting: { type: Type.STRING, description: `Select one lighting style from: ${LIGHTING_STYLES.join(', ')}` },
          pacing: { type: Type.STRING, description: `Select one pacing from: ${PACING_OPTIONS.join(', ')}` },
          environment: { type: Type.STRING, description: "A brief description of the setting, e.g., 'A cozy, dimly lit library'." },
          subject: { type: Type.STRING, description: "A brief description of the main subject, e.g., 'An antique leather-bound book'." },
          sequence: { type: Type.STRING, description: "A newline-separated list of 3-5 key actions, e.g., '1. Gently opening the book cover\\n2. Slowly turning the crisp pages'." },
          cameraMovement: { type: Type.STRING, description: `Select one from: ${CAMERA_MOVEMENTS.join(', ')}` },
          cameraAngle: { type: Type.STRING, description: `Select one from: ${CAMERA_ANGLES.join(', ')}` },
          cameraFocus: { type: Type.STRING, description: `Select one from: ${CAMERA_FOCUS.join(', ')}` },
          visualEffects: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Select a few from: ${VISUAL_EFFECTS.join(', ')}` },
          soundscapePrimary: { type: Type.STRING, description: `Select one from: ${PRIMARY_SOUNDS.join(', ')}` },
          soundscapeSecondary: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Select a few from: ${SECONDARY_SOUNDS.join(', ')}` },
          soundscapeQuality: { type: Type.STRING, description: `Select one from: ${SOUND_QUALITIES.join(', ')}` },
          asmrTriggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Select a few from: ${ASMR_TRIGGERS.join(', ')}` },
          materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: `Select a few from: ${CORE_MATERIALS.join(', ')}` },
        }
      };
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: suggestionSchema,
        }
      });
      
      const result = JSON.parse(response.text);
      setFormState(prev => ({
        ...prev,
        ...result,
        moods: Array.isArray(result.moods) ? result.moods : [],
        visualEffects: Array.isArray(result.visualEffects) ? result.visualEffects : [],
        soundscapeSecondary: Array.isArray(result.soundscapeSecondary) ? result.soundscapeSecondary : [],
        asmrTriggers: Array.isArray(result.asmrTriggers) ? result.asmrTriggers : [],
        materials: Array.isArray(result.materials) ? result.materials : [],
      }));

    } catch (error) {
      console.error("Error suggesting settings:", error);
    } finally {
      setIsSuggesting(false);
    }
  };


  const handleGenerateJson = useCallback(() => {
    const { idea, description, ...rest } = formState;
    const jsonObject = {
      title: idea,
      description: description || `An ASMR-style video about: ${idea}.`,
      style: "ASMR",
      mood: rest.moods,
      pacing: rest.pacing,
      environment: rest.environment,
      subject: rest.subject,
      sequence: rest.sequence.split('\n').filter(line => line.trim() !== ''),
      lighting: rest.lighting,
      camera: {
        movement: rest.cameraMovement,
        angle: rest.cameraAngle,
        focus: rest.cameraFocus,
      },
      soundscape: {
        primary: rest.soundscapePrimary,
        secondary: rest.soundscapeSecondary,
        quality: rest.soundscapeQuality,
      },
      visual_effects: rest.visualEffects,
      asmr_details: {
        triggers: rest.asmrTriggers,
        materials: rest.materials,
      }
    };
    setGeneratedJson(JSON.stringify(jsonObject, null, 2));
    setValidationStatus('unchecked');
    setNarrativePrompt('');
  }, [formState]);

  const updateFormStateFromJson = (jsonObject) => {
    if (!jsonObject) return;
    setFormState(prev => ({
        ...prev,
        idea: jsonObject.title || '',
        description: jsonObject.description || '',
        moods: jsonObject.mood || [],
        pacing: jsonObject.pacing || PACING_OPTIONS[0],
        environment: jsonObject.environment || '',
        subject: jsonObject.subject || '',
        sequence: Array.isArray(jsonObject.sequence) ? jsonObject.sequence.join('\n') : '',
        lighting: jsonObject.lighting || LIGHTING_STYLES[0],
        cameraMovement: jsonObject.camera?.movement || CAMERA_MOVEMENTS[0],
        cameraAngle: jsonObject.camera?.angle || CAMERA_ANGLES[0],
        cameraFocus: jsonObject.camera?.focus || CAMERA_FOCUS[0],
        visualEffects: jsonObject.visual_effects || [],
        soundscapePrimary: jsonObject.soundscape?.primary || PRIMARY_SOUNDS[0],
        soundscapeSecondary: jsonObject.soundscape?.secondary || [],
        soundscapeQuality: jsonObject.soundscape?.quality || SOUND_QUALITIES[0],
        asmrTriggers: jsonObject.asmr_details?.triggers || [],
        materials: jsonObject.asmr_details?.materials || [],
    }));
  };

  const handleRefineJson = async () => {
    if (!generatedJson || isRefining) return;
    setIsRefining(true);
    setValidationStatus('unchecked');

    const prompt = `You are an expert ASMR video director and prompt engineer for advanced video generation models. Your task is to analyze the following user-provided JSON prompt and refine it.

Your goal is to make the prompt more immersive, creative, consistent, and complete. Identify missing fields or inconsistencies and return a complete, enriched JSON object based on the original idea. All fields must be filled with creative and consistent values. The description should be sensory-rich. The sequence should outline key moments.

Analyze this JSON:
\`\`\`json
${generatedJson}
\`\`\`

Return ONLY the refined JSON object, matching the provided schema. Do not include any other text or explanation.`;
    
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        style: { type: Type.STRING },
        mood: { type: Type.ARRAY, items: { type: Type.STRING } },
        pacing: { type: Type.STRING },
        environment: { type: Type.STRING },
        subject: { type: Type.STRING },
        sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
        lighting: { type: Type.STRING },
        camera: {
          type: Type.OBJECT,
          properties: {
            movement: { type: Type.STRING },
            angle: { type: Type.STRING },
            focus: { type: Type.STRING },
          },
          required: ['movement', 'angle', 'focus']
        },
        soundscape: {
          type: Type.OBJECT,
          properties: {
            primary: { type: Type.STRING },
            secondary: { type: Type.ARRAY, items: { type: Type.STRING } },
            quality: { type: Type.STRING },
          },
          required: ['primary', 'secondary', 'quality']
        },
        visual_effects: { type: Type.ARRAY, items: { type: Type.STRING } },
        asmr_details: {
          type: Type.OBJECT,
          properties: {
            triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
            materials: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['triggers', 'materials']
        },
      }
    };

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      const resultJson = JSON.parse(response.text);
      setGeneratedJson(JSON.stringify(resultJson, null, 2));
      updateFormStateFromJson(resultJson);

    } catch (error) {
      console.error("Error refining JSON:", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerateNarrative = async () => {
    if (!generatedJson || isGeneratingNarrative) return;
    setIsGeneratingNarrative(true);
    setNarrativePrompt('');

    const userPromptExample = `macro, hyper-realistic video of a single frozen blue raspberry sitting inside a real glass tumbler on a pastel wooden surface. the raspberry resembles a blue version of apple snail eggs — translucent, plump, clustered tiny spheres, with a glossy frosted sheen. a clear glass pestle slowly descends into the glass, pressing down and crushing the blue raspberry clusters with a satisfying soft, icy popping sound, similar to breaking frozen caviar. crushed berry juices ooze out with a vivid blue color and slight frost vapor, pooling beautifully in the bottom of the glass. the background is a softly blurred pale pastel color, decorated with delicate twinkle fairy lights out of focus, creating a cozy, modern aesthetic. natural soft lighting, HDR, ultra-realistic detail, IMAX laser look, 8K, no music, only gentle ASMR crushing and icy crackling sounds.`;

    const prompt = `You are an expert prompt writer for text-to-video AI models. Your task is to convert a structured JSON object into a single, cohesive, and highly descriptive narrative paragraph. The paragraph should be a single block of text, incorporating all the details from the JSON to create an immersive and vivid scene description.

**Example of desired output format and style:**
'${userPromptExample}'

Now, based on that style, convert the following JSON object into a single narrative prompt paragraph. Do not add any preamble or explanation. Return only the generated paragraph.

JSON to convert:
\`\`\`json
${generatedJson}
\`\`\`
`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      setNarrativePrompt(response.text.trim());
    } catch (error) {
      console.error("Error generating narrative prompt:", error);
      setNarrativePrompt("Error: Could not generate narrative prompt.");
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  const handleReset = useCallback(() => {
    setFormState(initialState);
    setGeneratedJson(null);
    setValidationStatus('unchecked');
    setNarrativePrompt('');
  }, []);

  const handleCopyJson = useCallback(() => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    });
  }, [generatedJson]);
  
  const handleCopyNarrative = useCallback(() => {
    if (!narrativePrompt) return;
    navigator.clipboard.writeText(narrativePrompt).then(() => {
      setCopyNarrativeButtonText('Copied!');
      setTimeout(() => setCopyNarrativeButtonText('Copy'), 2000);
    });
  }, [narrativePrompt]);

  const handleDownloadJson = useCallback(() => {
    if (!generatedJson) return;
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = formState.idea.trim().toLowerCase().replace(/\s+/g, '_') || 'prompt';
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generatedJson, formState.idea]);

  const handleSelfTest = useCallback(() => {
    if (!generatedJson) return;
    try {
      const parsed = JSON.parse(generatedJson);
      const requiredKeys = ["title", "description", "style", "mood", "lighting", "camera", "soundscape", "visual_effects", "asmr_details", "pacing", "environment", "subject", "sequence"];
      const hasAllKeys = requiredKeys.every(key => key in parsed);
      const cameraKeysOk = "movement" in parsed.camera && "angle" in parsed.camera && "focus" in parsed.camera;
      const soundscapeKeysOk = "primary" in parsed.soundscape && "secondary" in parsed.soundscape && "quality" in parsed.soundscape;
      const asmrDetailsOk = "triggers" in parsed.asmr_details && "materials" in parsed.asmr_details;
      
      if (hasAllKeys && cameraKeysOk && soundscapeKeysOk && asmrDetailsOk) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
      }
    } catch (e) {
      setValidationStatus('invalid');
    }
  }, [generatedJson]);

  return (
    <div className="container">
      <header>
        <div>
            <h1>ASMR Veo 3 JSON Prompt Generator</h1>
            <p>Turn simple ideas into deeply detailed JSON prompts for any ASMR scenario.</p>
        </div>
        <button className="button secondary icon-only" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <span className="icon">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
            <span className="tooltip">Switch to {theme === 'light' ? 'dark' : 'light'} mode</span>
        </button>
      </header>

      <main className="main-content">
        <section className="controls-panel">
          <FormControl label="Core Idea">
            <div className="input-group">
               <input
                type="text"
                name="idea"
                className="input"
                placeholder="e.g., restoring a vintage watch or upload image"
                value={formState.idea}
                onChange={handleInputChange}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                style={{ display: 'none' }}
                aria-hidden="true"
              />
              <button className="button secondary icon-only" onClick={handleEnhanceIdea} disabled={isEnhancing || isAnalyzing || isSuggesting || !formState.idea}>
                <span className={`icon ${isEnhancing ? 'loading' : ''}`}>{isEnhancing ? 'progress_activity' : 'auto_fix_high'}</span>
                <span className="tooltip">Enhance with AI</span>
              </button>
              <button className="button secondary icon-only" onClick={handleSuggestSettings} disabled={isSuggesting || isEnhancing || isAnalyzing || !formState.idea}>
                <span className={`icon ${isSuggesting ? 'loading' : ''}`}>{isSuggesting ? 'progress_activity' : 'tips_and_updates'}</span>
                <span className="tooltip">Suggest settings with AI</span>
              </button>
              <button className="button secondary icon-only" onClick={() => fileInputRef.current.click()} disabled={isAnalyzing || isEnhancing || isSuggesting}>
                 <span className={`icon ${isAnalyzing ? 'loading' : ''}`}>{isAnalyzing ? 'progress_activity' : 'add_photo_alternate'}</span>
                 <span className="tooltip">Generate from Image</span>
              </button>
            </div>
          </FormControl>
          <FormControl label="Scene Description">
            <textarea
                name="description"
                className="textarea"
                placeholder="A detailed description of the scene, atmosphere, and key actions. Use the AI enhancer to generate this."
                value={formState.description}
                onChange={handleInputChange}
            />
          </FormControl>
          
          <details open>
            <summary>Scene & Narrative</summary>
            <div className="details-content">
              <FormControl label="Mood">
                <MultiSelectGroup items={MOODS} selectedItems={formState.moods} onToggle={(item) => toggleMultiSelect(item, 'moods')} />
              </FormControl>
               <FormControl label="Pacing & Rhythm">
                <SelectControl value={formState.pacing} onChange={e => setFormState(p => ({...p, pacing: e.target.value}))} options={PACING_OPTIONS} />
              </FormControl>
               <FormControl label="Environment / Setting">
                 <input type="text" name="environment" className="input" placeholder="e.g., A quiet, sterile laboratory" value={formState.environment} onChange={handleInputChange} />
              </FormControl>
              <FormControl label="Subject Details">
                 <input type="text" name="subject" className="input" placeholder="e.g., Gloved hands moving with precision" value={formState.subject} onChange={handleInputChange} />
              </FormControl>
               <FormControl label="Action Sequence (one action per line)">
                <textarea name="sequence" className="textarea" placeholder="1. Opens the watch case&#10;2. Gently removes the gears&#10;3. Cleans each part with a soft brush" value={formState.sequence} onChange={handleInputChange} />
              </FormControl>
            </div>
          </details>

          <details>
            <summary>ASMR Details</summary>
            <div className="details-content">
              <FormControl label="Primary ASMR Triggers">
                <MultiSelectGroup items={ASMR_TRIGGERS} selectedItems={formState.asmrTriggers} onToggle={(item) => toggleMultiSelect(item, 'asmrTriggers')} />
              </FormControl>
              <FormControl label="Core Materials">
                <MultiSelectGroup items={CORE_MATERIALS} selectedItems={formState.materials} onToggle={(item) => toggleMultiSelect(item, 'materials')} />
              </FormControl>
            </div>
          </details>

          <details>
            <summary>Camera & Visuals</summary>
            <div className="details-content">
                <FormControl label="Lighting Style">
                    <SelectControl value={formState.lighting} onChange={e => setFormState(p => ({...p, lighting: e.target.value}))} options={LIGHTING_STYLES} />
                </FormControl>
              <FormControl label="Camera Movement">
                <SelectControl value={formState.cameraMovement} onChange={e => setFormState(p => ({...p, cameraMovement: e.target.value}))} options={CAMERA_MOVEMENTS} />
              </FormControl>
               <FormControl label="Camera Angle">
                <SelectControl value={formState.cameraAngle} onChange={e => setFormState(p => ({...p, cameraAngle: e.target.value}))} options={CAMERA_ANGLES} />
              </FormControl>
              <FormControl label="Camera Focus">
                <SelectControl value={formState.cameraFocus} onChange={e => setFormState(p => ({...p, cameraFocus: e.target.value}))} options={CAMERA_FOCUS} />
              </FormControl>
              <FormControl label="Visual Effects">
                <MultiSelectGroup items={VISUAL_EFFECTS} selectedItems={formState.visualEffects} onToggle={(item) => toggleMultiSelect(item, 'visualEffects')} />
              </FormControl>
            </div>
          </details>

          <details>
            <summary>Soundscape</summary>
            <div className="details-content">
              <FormControl label="Primary Sound">
                <SelectControl value={formState.soundscapePrimary} onChange={e => setFormState(p => ({...p, soundscapePrimary: e.target.value}))} options={PRIMARY_SOUNDS} />
              </FormControl>
              <FormControl label="Secondary Sounds">
                <MultiSelectGroup items={SECONDARY_SOUNDS} selectedItems={formState.soundscapeSecondary} onToggle={(item) => toggleMultiSelect(item, 'soundscapeSecondary')} />
              </FormControl>
              <FormControl label="Sound Quality">
                <SelectControl value={formState.soundscapeQuality} onChange={e => setFormState(p => ({...p, soundscapeQuality: e.target.value}))} options={SOUND_QUALITIES} />
              </FormControl>
            </div>
          </details>

          <div className="action-buttons">
            <button className="button primary" onClick={handleGenerateJson}>
              <span className="icon">auto_awesome</span> Generate JSON
            </button>
            <button className="button secondary" onClick={handleReset}>
              <span className="icon">refresh</span> Reset
            </button>
          </div>
        </section>

        <section className="output-panel">
          <div className="output-area">
             <div className="output-header">
              <h3>Generated JSON</h3>
              <div className="output-actions">
                 {generatedJson && (
                   <>
                    <button className="button secondary" onClick={handleCopyJson} disabled={copyButtonText === 'Copied!'}>
                      <span className="icon">content_copy</span> {copyButtonText}
                    </button>
                    <button className="button secondary" onClick={handleDownloadJson}>
                      <span className="icon">download</span> Download
                    </button>
                   </>
                 )}
              </div>
            </div>
            <div className="json-preview">
              {generatedJson ? (
                <SyntaxHighlighter language="json" style={theme === 'light' ? atomOneLight : atomOneDark} customStyle={{ height: '100%' }}>
                  {generatedJson}
                </SyntaxHighlighter>
              ) : (
                <div className="placeholder">
                  <p>Your generated JSON will appear here.</p>
                </div>
              )}
            </div>
          </div>
           {generatedJson && (
            <div className="action-buttons">
              <button className="button primary" onClick={handleRefineJson} disabled={isRefining}>
                <span className={`icon ${isRefining ? 'loading' : ''}`}>{isRefining ? 'progress_activity' : 'auto_fix_high'}</span>
                {isRefining ? 'Refining...' : 'Refine with AI'}
              </button>
              <button className="button secondary" onClick={handleSelfTest}>
                <span className="icon">science</span> Run Self-Test
              </button>
              <div className={`validation-status ${validationStatus}`}>
                {validationStatus === 'valid' && <><span className="icon">check_circle</span> Schema valid</>}
                {validationStatus === 'invalid' && <><span className="icon">error</span> Schema invalid</>}
                {validationStatus === 'unchecked' && <><span className="icon">help</span> Not checked</>}
              </div>
            </div>
           )}

          {generatedJson && (
            <>
              <div className="output-area" style={{ marginTop: '20px', minHeight: '200px', flexShrink: 0 }}>
                <div className="output-header">
                  <h3>Narrative Prompt</h3>
                  {narrativePrompt && !isGeneratingNarrative && (
                    <div className="output-actions">
                      <button className="button secondary" onClick={handleCopyNarrative} disabled={copyNarrativeButtonText === 'Copied!'}>
                        <span className="icon">content_copy</span> {copyNarrativeButtonText}
                      </button>
                    </div>
                  )}
                </div>
                <div className="json-preview">
                  {isGeneratingNarrative ? (
                    <div className="placeholder">
                      <span className="icon loading" style={{fontSize: '2rem'}}>progress_activity</span>
                    </div>
                  ) : narrativePrompt ? (
                    <textarea
                      readOnly
                      className="narrative-output"
                      value={narrativePrompt}
                    />
                  ) : (
                    <div className="placeholder">
                      <p>Generate a descriptive paragraph from your JSON.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="action-buttons">
                <button className="button primary" onClick={handleGenerateNarrative} disabled={isGeneratingNarrative}>
                  <span className={`icon ${isGeneratingNarrative ? 'loading' : ''}`}>{isGeneratingNarrative ? 'progress_activity' : 'notes'}</span>
                  {isGeneratingNarrative ? 'Generating...' : 'Generate Narrative Prompt'}
                </button>
              </div>
            </>
          )}

        </section>
      </main>
    </div>
  );
}