import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
    route("/ai-resume-analyzer/", "routes/home.tsx"),
    route("/ai-resume-analyzer/auth", "routes/auth.tsx"),
    route("/ai-resume-analyzer/upload", "routes/upload.tsx"),
    route("/ai-resume-analyzer/resume/:id", "routes/resume.tsx"),
    route("/ai-resume-analyzer/wipe", "routes/wipe.tsx"),
] satisfies RouteConfig;
