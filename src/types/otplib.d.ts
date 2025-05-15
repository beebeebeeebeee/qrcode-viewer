declare module '@otplib/preset-browser' {
  export const authenticator: {
    options: {
      digits: number;
    };
    generate: (secret: string) => string;
  };
} 