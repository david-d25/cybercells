attribute vec4 vertexPosition;

uniform mat4 viewMatrix;

void main() {
    gl_Position = viewMatrix * vertexPosition;
}