
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
  const [validationStatus, setValidationStatus] = useState('unchecked');
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [isEnhancing, setIsEnhancing] = useState(false);

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
      // Basic error feedback can be added here
    } finally {
      setIsEnhancing(false);
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
  }, [formState]);

  const handleReset = useCallback(() => {
    setFormState(initialState);
    setGeneratedJson(null);
    setValidationStatus('unchecked');
  }, []);

  const handleCopyJson = useCallback(() => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(generatedJson).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy'), 2000);
    });
  }, [generatedJson]);

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
        <h1>ASMR Veo 3 JSON Prompt Generator</h1>
        <p>Turn simple ideas into deeply detailed JSON prompts for any ASMR scenario.</p>
      </header>

      <main className="main-content">
        <section className="controls-panel">
          <FormControl label="Core Idea">
            <div className="input-group">
               <input
                type="text"
                name="idea"
                className="input"
                placeholder="e.g., restoring a vintage watch"
                value={formState.idea}
                onChange={handleInputChange}
              />
              <button className="button secondary" onClick={handleEnhanceIdea} disabled={isEnhancing || !formState.idea}>
                <span className={`icon ${isEnhancing ? 'loading' : ''}`}>{isEnhancing ? 'progress_activity' : 'auto_fix_high'}</span>
                {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
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
                <SyntaxHighlighter language="json" style={atomOneDark} customStyle={{ height: '100%' }}>
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
        </section>
      </main>
    </div>
  );
}
