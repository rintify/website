

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGElement>>;
  export default content;
}

type NextParams = { params: Promise<Record<string,string>> }
