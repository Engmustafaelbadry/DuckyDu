import { toast as sonnerToast } from "sonner";
import "@/components/ui/pixelact-ui/styles/styles.css";

export function toast(toast) {
  return sonnerToast.custom((id) => <Toast id={id} title={toast} />);
}

function Toast(props) {
  const { title } = props;

  return (
    <div
      className="flex items-center shadow-(--pixel-box-shadow) box-shadow-margin bg-background w-full md:max-w-[364px] p-4">
      <p className="text-sm text-foreground pixel-font">{title}</p>
    </div>
  );
}

export { Toast };
