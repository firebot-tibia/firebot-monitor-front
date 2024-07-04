'use client';

import { Inter } from "next/font/google";
import '../styles/globals.css';
import { ChakraProvider, theme } from "@chakra-ui/react";
import { FC } from "react";

const inter = Inter({ subsets: ["latin"] });

const RootLayout: FC = ({ children }) => {
  return (
    <html lang="en" data-theme="light">
      <head />
      <body className={`chakra-ui-light ${inter.className}`}>
        <ChakraProvider theme={theme}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
};
export default RootLayout;
