import { Config } from "@remotion/cli/config";

// The lightning is the widget's real WebGL2 shader; headless Chrome needs ANGLE for WebGL2.
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("png");
