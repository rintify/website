

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>;
  export default content;
}

type NextParams<T = Record<string,string>> = { params: Promise<T> }
