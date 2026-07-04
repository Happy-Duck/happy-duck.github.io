(function(){function e(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:null}function t(t){let n=t.getContext(`webgl2`,{alpha:!0,antialias:!1});if(!n||n.isContextLost&&n.isContextLost())return null;let r=e(n,n.VERTEX_SHADER,`#version 300 es
void main() {
  vec2 pos = vec2(float(gl_VertexID << 1 & 2), float(gl_VertexID & 2));
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`),i=e(n,n.FRAGMENT_SHADER,`#version 300 es
precision mediump float;
uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_tint;
uniform float u_strength;
out vec4 outColor;

float beams(float s, float t) {
  float b = sin(s * 4.7 - t * 0.26) * 0.5 + 0.5;
  b *= sin(s * 9.1 + t * 0.17) * 0.5 + 0.5;
  b *= sin(s * 2.3 + t * 0.09) * 0.5 + 0.5;
  b *= sin(s * 15.7 - t * 0.31) * 0.35 + 0.65;
  return pow(b, 1.8) * 3.2;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time;
  float depth = 1.0 - uv.y;
  float aspect = u_res.x / u_res.y;
  float s1 = (uv.x + depth * 0.28) * aspect;
  float s2 = (uv.x + depth * 0.38) * aspect;
  float sway = sin(t * 0.12 + uv.y * 1.7) * 0.045;
  float b = beams(s1 + sway, t) + 0.6 * beams(s2 * 1.31 + 4.7 - sway, t * 0.85);
  float fade = pow(uv.y, 1.7);
  float shimmer = smoothstep(0.90, 1.0, uv.y)
                * (sin(uv.x * aspect * 38.0 + t * 1.1)
                 * sin(uv.x * aspect * 23.0 - t * 0.7) * 0.5 + 0.5);
  float a = clamp(b * fade * 0.32 + shimmer * 0.22, 0.0, 1.0) * u_strength;
  outColor = vec4(u_tint * a, a);
}`);if(!r||!i)return null;let a=n.createProgram();if(n.attachShader(a,r),n.attachShader(a,i),n.linkProgram(a),!n.getProgramParameter(a,n.LINK_STATUS))return null;n.useProgram(a);let o=n.getUniformLocation(a,`u_time`),s=n.getUniformLocation(a,`u_res`),c=n.getUniformLocation(a,`u_tint`),l=n.getUniformLocation(a,`u_strength`);return{resize(e,r){t.width=Math.max(1,e>>1),t.height=Math.max(1,r>>1),n.viewport(0,0,t.width,t.height)},setTod(e){n.uniform3fv(c,e.tint),n.uniform1f(l,e.strength)},draw(e){n.uniform1f(o,e),n.uniform2f(s,t.width,t.height),n.drawArrays(n.TRIANGLES,0,3)}}}let n=typeof requestAnimationFrame==`function`?requestAnimationFrame:e=>setTimeout(()=>e(performance.now()),16),r=typeof cancelAnimationFrame==`function`?cancelAnimationFrame:clearTimeout,i=null,a=!1,o=!1,s=0,c=performance.now();function l(){s=n(l),!(!a||!i)&&i.draw((performance.now()-c)/1e3)}self.onmessage=e=>{let c=e.data;switch(c.type){case`init`:if(i=t(c.canvas),!i)return;o=c.reduced,i.resize(c.w,c.h),i.setTod(c.rays),o?i.draw(0):s=n(l);break;case`resize`:i?.resize(c.w,c.h),o&&i?.draw(0);break;case`tod`:i?.setTod(c.rays),o&&i?.draw(0);break;case`visible`:a=c.visible;break;case`stop`:r(s),a=!1;break}}})();