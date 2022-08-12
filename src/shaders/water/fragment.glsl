uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform vec3 uFogColor;
uniform float uFogDistance;


varying float vElevation;
varying float vDrawDistance;

void main() {
    float waterMixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 waterColor = mix(uDepthColor, uSurfaceColor, waterMixStrength);

    float fogMixStrength = clamp(vDrawDistance / uFogDistance, 0.0, 1.0);
    vec3 color = mix(waterColor, uFogColor, fogMixStrength);

    gl_FragColor = vec4(color, 1.0);
}