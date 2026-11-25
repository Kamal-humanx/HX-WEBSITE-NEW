"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

/**
 * Project thumbnail with a cursor-local liquid ripple (after 14islands.com).
 * A small "flow map" remembers how the cursor has been moving: every frame the cursor stamps its
 * velocity into the map inside a soft circle (radius ≈ 14% of the image width, fading to zero at the
 * rim), and the whole map decays back to still in about half a second. The image is drawn through
 * that map, so only the pixels near the cursor are dragged along its path, with a slight liquid
 * wobble, and settle once it stops. WebGL, created on first hover; the plain <Image> shows otherwise
 * (and with reduced motion, or if WebGL is unavailable).
 */

const RADIUS = 0.14; // of the image width
const STRENGTH = 0.045; // max UV displacement (a touch softer than the reference)
const DECAY = 0.915; // per frame (~0.5s to settle)
const FLOW_SIZE = 128;

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
const FLOW = `precision highp float;varying vec2 v;uniform sampler2D tPrev;uniform vec2 uMouse,uVel;uniform float uAspect,uRadius,uDecay;
void main(){vec2 f=texture2D(tPrev,v).rg*2.-1.;
f=sign(f)*max(abs(f)*uDecay-.004,0.);
vec2 d=v-uMouse;d.x*=uAspect;float fall=smoothstep(uRadius,0.,length(d));
f=clamp(f+uVel*fall,-1.,1.);gl_FragColor=vec4(f*.5+.5,0.,1.);}`;
const SHOW = `precision highp float;varying vec2 v;uniform sampler2D tImg,tFlow;uniform vec2 uScale,uOffset;uniform float uTime,uStrength;
void main(){vec2 f=texture2D(tFlow,v).rg*2.-1.;
float w=.65+.35*sin((v.x*1.3+v.y)*26.+uTime*5.);
vec2 uv=clamp(v-f*uStrength*w,0.,1.);
vec2 iuv=uv*uScale+uOffset;iuv.y=1.-iuv.y;
gl_FragColor=texture2D(tImg,iuv);}`;

type GLState = {
  gl: WebGLRenderingContext;
  flow: WebGLProgram;
  show: WebGLProgram;
  tex: WebGLTexture;
  fb: [WebGLFramebuffer, WebGLFramebuffer];
  ft: [WebGLTexture, WebGLTexture];
  i: number;
  iw: number;
  ih: number;
};

function program(gl: WebGLRenderingContext, fs: string) {
  const mk = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, mk(gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, "p");
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

function texture(gl: WebGLRenderingContext, w: number, h: number) {
  const t = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  if (w) {
    const mid = new Uint8Array(w * h * 4);
    for (let i = 0; i < mid.length; i += 4) {
      mid[i] = 128;
      mid[i + 1] = 128;
      mid[i + 3] = 255;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, mid);
  }
  return t;
}

export function RippleImage({ src, alt, sizes, className = "" }: { src: string; alt: string; sizes: string; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let S: GLState | null = null;
    let failed = false;
    let raf = 0, over = false, energy = 0, t0 = 0;
    let mx = 0.5, my = 0.5, px = -1, py = -1, vx = 0, vy = 0;

    const init = () => {
      if (S || failed) return;
      const img = wrap.querySelector("img");
      const gl = canvas.getContext("webgl", { premultipliedAlpha: false, antialias: false });
      if (!gl || !img) return void (failed = true);
      const flow = program(gl, FLOW), show = program(gl, SHOW);
      if (!flow || !show) return void (failed = true);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const ft: [WebGLTexture, WebGLTexture] = [texture(gl, FLOW_SIZE, FLOW_SIZE), texture(gl, FLOW_SIZE, FLOW_SIZE)];
      const fb = ft.map((t) => {
        const f = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        return f;
      }) as [WebGLFramebuffer, WebGLFramebuffer];
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      const tex = texture(gl, 0, 0);
      const state: GLState = { gl, flow, show, tex, fb, ft, i: 0, iw: 0, ih: 0 };
      /* the same file the <Image> already loaded (same origin), at its natural size */
      const pic = new window.Image();
      pic.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pic);
        state.iw = pic.naturalWidth;
        state.ih = pic.naturalHeight;
        S = state;
        if (over) start();
      };
      pic.onerror = () => (failed = true);
      pic.src = img.currentSrc || img.src;
    };

    const size = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return r;
    };

    const frame = (now: number) => {
      raf = 0;
      if (!S) return;
      const { gl } = S;
      const r = size();
      const aspect = r.width / Math.max(1, r.height);
      if (!t0) t0 = now;

      /* velocity this frame, in image widths (capped so a flick doesn't tear) */
      const vel = [Math.max(-1, Math.min(1, vx * 9)), Math.max(-1, Math.min(1, -vy * 9))];
      vx = vy = 0;

      /* 1 — flow map: decay, then stamp the cursor's velocity inside the soft circle */
      const src = S.i, dst = 1 - S.i;
      gl.bindFramebuffer(gl.FRAMEBUFFER, S.fb[dst]);
      gl.viewport(0, 0, FLOW_SIZE, FLOW_SIZE);
      gl.useProgram(S.flow);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, S.ft[src]);
      gl.uniform1i(gl.getUniformLocation(S.flow, "tPrev"), 0);
      gl.uniform2f(gl.getUniformLocation(S.flow, "uMouse"), mx, 1 - my);
      gl.uniform2f(gl.getUniformLocation(S.flow, "uVel"), over ? vel[0] : 0, over ? vel[1] : 0);
      gl.uniform1f(gl.getUniformLocation(S.flow, "uAspect"), aspect);
      gl.uniform1f(gl.getUniformLocation(S.flow, "uRadius"), RADIUS);
      gl.uniform1f(gl.getUniformLocation(S.flow, "uDecay"), DECAY);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      S.i = dst;

      /* 2 — the image, drawn through the flow map, object-fit: cover */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(S.show);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, S.tex);
      gl.uniform1i(gl.getUniformLocation(S.show, "tImg"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, S.ft[dst]);
      gl.uniform1i(gl.getUniformLocation(S.show, "tFlow"), 1);
      const ia = S.iw / S.ih;
      const sx = aspect < ia ? aspect / ia : 1, sy = aspect < ia ? 1 : ia / aspect;
      gl.uniform2f(gl.getUniformLocation(S.show, "uScale"), sx, sy);
      gl.uniform2f(gl.getUniformLocation(S.show, "uOffset"), (1 - sx) / 2, (1 - sy) / 2);
      gl.uniform1f(gl.getUniformLocation(S.show, "uTime"), (now - t0) / 1000);
      gl.uniform1f(gl.getUniformLocation(S.show, "uStrength"), STRENGTH);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      /* keep going while hovered or while the trail is still settling */
      energy = energy * DECAY + Math.hypot(vel[0], vel[1]);
      if (over || energy > 0.002) raf = requestAnimationFrame(frame);
      else canvas.style.opacity = "0";
    };

    const start = () => {
      if (!S) return init();
      canvas.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      over = true;
      px = py = -1;
      start();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = wrap.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
      if (px >= 0) {
        vx += mx - px;
        vy += my - py;
      }
      px = mx;
      py = my;
      if (!raf && S) start();
    };
    const onLeave = () => (over = false);

    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    return () => {
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
      S?.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Image src={src} alt={alt} fill sizes={sizes} className={className} />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 h-full w-full opacity-0 ${className}`}
      />
    </div>
  );
}
