export const DEFAULT_APP_SETTINGS = {
  skin: "STANDARD",
  backgroundImg: undefined,
  rows: 3,
  cols: 3,
  winAudio: "sounds/win.wav",
};

export const ESCAPP_CLIENT_SETTINGS = {
  imagesPath: "./images/",
};

export const THEMES = {
  BASIC: "BASIC",
  FUTURISTIC: "FUTURISTIC",
  STANDARD: "STANDARD",
  RETRO: "RETRO",
};

export const THEME_ASSETS = {
  [THEMES.RETRO]: {},
  [THEMES.BASIC]: {
    backgroundImg: "/images/basic_background.jpg",
    frameImg: "/images/basic_frame.png",
    framePaddingTop: 25,
    framePaddingBottom: 23,
    framePaddingLeft: 25,
    framePaddingRight: 27,
  },
  [THEMES.FUTURISTIC]: {},
};
