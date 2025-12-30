import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <Loader2 className="w-12 h-12 text-[#28ac30] animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
      <p className="text-gray-500">This will only take a moment.</p>
    </div>
  );
}