// vite.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
var vite_config_default = defineConfig({
  test: {
    globals: true
  },
  plugins: [
    tsconfigPaths(),
    react(),
    process.env.VITEST ? {
      name: "css-preprocess",
      enforce: "pre",
      transform(code, id) {
        if (/\.(css|sass|scss)$/.test(id))
          return { code: "" };
      }
    } : void 0
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnO1xuaW1wb3J0IHRzY29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocyc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHRzY29uZmlnUGF0aHMoKSxcblxuICAgIHJlYWN0KCksXG4gICAgcHJvY2Vzcy5lbnYuVklURVNUXG4gICAgICA/IHtcbiAgICAgICAgICBuYW1lOiAnY3NzLXByZXByb2Nlc3MnLFxuICAgICAgICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgICAgICAgIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgICAgICAgICAgaWYgKC9cXC4oY3NzfHNhc3N8c2NzcykkLy50ZXN0KGlkKSkgcmV0dXJuIHsgY29kZTogJycgfTtcbiAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICA6IHVuZGVmaW5lZCxcbiAgXSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBO0FBQ0E7QUFDQTtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxFQUNYO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxjQUFjO0FBQUEsSUFFZCxNQUFNO0FBQUEsSUFDTixRQUFRLElBQUksU0FDUjtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsVUFBVSxNQUFNLElBQUk7QUFDbEIsWUFBSSxxQkFBcUIsS0FBSyxFQUFFO0FBQUcsaUJBQU8sRUFBRSxNQUFNLEdBQUc7QUFBQSxNQUN2RDtBQUFBLElBQ0YsSUFDQTtBQUFBLEVBQ047QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
