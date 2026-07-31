import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ScriptGeneratorClient from "./ScriptGeneratorClient";

export default function ScriptGenPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          加载中...
        </div>
      }
    >
      <ScriptGeneratorClient />
    </Suspense>
  );
}
