import { useEffect, useRef, useState } from "react";
import { Volume2, Square, RotateCw } from "lucide-react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const modelUrl = "/api/founders-guide";
export default function WellnessAvatar({ narration }: { narration: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [modelState, setModelState] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [speaking, setSpeaking] = useState(false);
  const [audioError, setAudioError] = useState("");
  const generation = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resetCamera = useRef<(() => void) | null>(null);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let disposed = false;
    let frame = 0;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setModelState("error");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      "aria-label",
      "Interactive 3D FitFlix guide. Drag to rotate."
    );
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      34,
      host.clientWidth / host.clientHeight,
      0.01,
      100
    );
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.minPolarAngle = Math.PI / 2.8;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.minAzimuthAngle = -Math.PI / 2;
    controls.maxAzimuthAngle = Math.PI / 2;
    const ambient = new THREE.HemisphereLight(0xfff3dc, 0x6b4d37, 2.2);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffe0b4, 3.3);
    key.position.set(2, 3, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc3d3e0, 1.2);
    fill.position.set(-3, 1, 2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xce7930, 1.5);
    rim.position.set(2, 2, -3);
    scene.add(rim);
    const render = () => {
      if (!disposed) renderer.render(scene, camera);
    };
    controls.addEventListener("change", render);
    let model: THREE.Object3D | null = null;
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      gltf => {
        if (disposed) {
          gltf.scene.traverse(object => {
            if (object instanceof THREE.Mesh) object.geometry.dispose();
          });
          return;
        }
        model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        const scale = 2.4 / Math.max(size.x, size.y, size.z);
        model.position.copy(centre.multiplyScalar(-scale));
        model.scale.setScalar(scale);
        scene.add(model);
        camera.position.set(0, 0.15, 5.3);
        controls.target.set(0, 0.1, 0);
        controls.minDistance = 3.8;
        controls.maxDistance = 7.3;
        resetCamera.current = () => {
          camera.position.set(0, 0.15, 5.3);
          controls.target.set(0, 0.1, 0);
          controls.update();
          render();
        };
        controls.update();
        render();
        setModelState("ready");
      },
      undefined,
      () => {
        if (!disposed) setModelState("error");
      }
    );
    const observer = new ResizeObserver(() => {
      if (disposed) return;
      const width = host.clientWidth,
        height = host.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    });
    observer.observe(host);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      controls.dispose();
      resetCamera.current = null;
      model?.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach(material => {
            Object.values(material).forEach(value => {
              if (value instanceof THREE.Texture) value.dispose();
            });
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  useEffect(
    () => () => {
      generation.current++;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );
  function play() {
    if (!("speechSynthesis" in window)) {
      setAudioError(
        "Voice playback is not supported in this browser. Your full transcript is below."
      );
      return;
    }
    generation.current++;
    window.speechSynthesis.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    setAudioError("");
    setSpeaking(true);
    const id = generation.current;
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find(v => v.lang === "en-IN") ||
      voices.find(v => v.lang.startsWith("en-"));
    const parts = narration.match(/[^.!?]+[.!?]?/g) || [narration];
    let index = 0;
    function next() {
      if (generation.current !== id) return;
      if (index >= parts.length) {
        setSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(parts[index++].trim());
      utteranceRef.current = utterance;
      utterance.lang = voice?.lang || "en-IN";
      if (voice) utterance.voice = voice;
      utterance.rate = 0.92;
      utterance.pitch = 1;
      utterance.onend = next;
      utterance.onerror = event => {
        if (generation.current !== id) return;
        setSpeaking(false);
        if (event.error !== "interrupted" && event.error !== "canceled")
          setAudioError(
            "Your browser could not play the voice. You can read the complete briefing below."
          );
      };
      window.speechSynthesis.speak(utterance);
    }
    next();
  }
  return (
    <section
      className="avatar-panel"
      aria-label="Your 3D guide and voice briefing"
    >
      <div className="avatar-label">
        <span className="eyebrow">YOUR 3D FITFLIX GUIDE</span>
        <div
          className={`avatar-indicator ${speaking ? "speaking" : ""}`}
          aria-label={speaking ? "Voice playing" : "Voice stopped"}
        >
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="avatar-view" ref={container}>
        {modelState !== "ready" && (
          <span className="avatar-status">
            {modelState === "loading"
              ? "Loading your 3D guide…"
              : "3D view unavailable on this device. Your audio and transcript are still available."}
          </span>
        )}
      </div>
      <div className="avatar-buttons">
        <button className="button" onClick={play}>
          {speaking ? (
            <>
              <Square size={15} /> Stop briefing
            </>
          ) : (
            <>
              <Volume2 size={18} /> Hear my personal brief
            </>
          )}
        </button>
        {modelState === "ready" && (
          <button
            className="text-button"
            onClick={() => resetCamera.current?.()}
            style={{ marginTop: 13, fontSize: 10, color: "#c6aa80" }}
          >
            <RotateCw size={13} /> Reset 3D view
          </button>
        )}
        <p>
          Original AI-generated 3D guide, not the founder or a clinician. Drag
          to rotate. Audio uses your browser’s available voice; no autoplay or
          cloned founder voice.
        </p>
        {audioError && (
          <p role="status" style={{ color: "#e2b09d" }}>
            {audioError}
          </p>
        )}
        <details style={{ marginTop: 13, fontSize: 10, color: "#cfb68e" }}>
          <summary style={{ cursor: "pointer" }}>
            Read the spoken-brief transcript
          </summary>
          <p>{narration}</p>
        </details>
      </div>
    </section>
  );
}
