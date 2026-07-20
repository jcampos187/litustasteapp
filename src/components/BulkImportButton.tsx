"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import BulkImportModal from "./BulkImportModal";

export default function BulkImportButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-lt-cream-dark px-5 py-2.5 text-sm font-semibold text-lt-charcoal/70 transition-all hover:border-lt-terracotta/30 hover:text-lt-terracotta hover:shadow-sm"
      >
        <Upload className="h-4 w-4" />
        Importar Masivamente
      </button>

      {isOpen && (
        <BulkImportModal
          onClose={() => setIsOpen(false)}
          onSuccess={() => {
            // Trigger a page refresh to show newly imported meals
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
