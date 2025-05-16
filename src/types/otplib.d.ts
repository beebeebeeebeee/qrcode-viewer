declare module '@otplib/preset-browser' {
  export const authenticator: {
    options: {
      digits: number;
      epoch: number;
    };
    generate: (secret: string) => string;
  };
} 