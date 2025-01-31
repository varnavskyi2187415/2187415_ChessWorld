import { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

interface BasicColumnProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode;
}

const BasicColumn = ({ children, style, ...props }: BasicColumnProps) => {
  const customStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyItems: "center",
    justifyContent: "center",
    alignItems: "center",
    ...style,
  };

  return (
    <div style={customStyle} {...props}>
      {children}
    </div>
  );
};

export default BasicColumn;
