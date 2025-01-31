import { CSSProperties, DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";

interface BasicRowProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode;
}

const BasicRow = ({ children, style, ...props }: BasicRowProps) => {
  const customStyle: CSSProperties = {
    display: "flex",
    flexDirection: "row",
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

export default BasicRow;
