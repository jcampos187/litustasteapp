"use client";

import { useState } from "react";
import { X, AlertCircle, CheckCircle, Upload, FileText, Download } from "lucide-react";

interface ParsedMeal {
  row: number;
  name: string;
  description: string;
  price: number;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  portionSize: string | null;
  dietaryTags: string[];
  errors: string[];
}

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const EXAMPLE_CSV = `name,description,price,calories,protein,carbs,fat,portion,tags
Pollo Teriyaki,Arroz con vegetales y pollo glaseado,3500,500,30,45,12,400g,high-protein
Bowl de Quinoa,Quinoa con vegetales asados,4200,450,15,52,18,,vegan,gluten-free`;

const TEMPLATE_CSV = `name,description,price,calories,protein,carbs,fat,portion,tags
Escribe aquí el nombre,"Escribe aquí la descripción (puede incluir comas)",3500,500,30,45,12,400g,etiqueta-1`;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function BulkImportModal({ onClose, onSuccess }: BulkImportModalProps) {
  const [rawText, setRawText] = useState("");
  const [parsedMeals, setParsedMeals] = useState<ParsedMeal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const parseCSV = () => {
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      setResult({ success: false, message: "Debes incluir al menos una línea de datos (encabezados + 1 platillo)" });
      return;
    }

    // Parse headers
    const rawHeaders = parseCSVLine(lines[0]);
    const headers = rawHeaders.map(normalizeHeader);

    // Find column indices
    const nameIdx = headers.findIndex((h) => h === "name");
    const descIdx = headers.findIndex((h) => h === "description");
    const priceIdx = headers.findIndex((h) => h === "price");
    const calIdx = headers.findIndex((h) => h === "calories");
    const protIdx = headers.findIndex((h) => h === "protein");
    const carbsIdx = headers.findIndex((h) => h === "carbs");
    const fatIdx = headers.findIndex((h) => h === "fat");
    const portionIdx = headers.findIndex((h) => h === "portion");
    const tagsIdx = headers.findIndex((h) => h === "tags");

    if (nameIdx === -1 || priceIdx === -1) {
      setResult({
        success: false,
        message: "El CSV debe tener al menos las columnas 'name' y 'price'. Columnas encontradas: " + rawHeaders.join(", "),
      });
      return;
    }

    const meals: ParsedMeal[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      const row = i + 1;
      const errors: string[] = [];

      const name = cols[nameIdx] || "";
      const priceRaw = cols[priceIdx]?.replace(/[₡$,]/g, "") || "";
      const price = parseFloat(priceRaw);
      const description = descIdx >= 0 ? cols[descIdx] || "" : "";
      const calories = calIdx >= 0 && cols[calIdx] ? parseInt(cols[calIdx]) || null : null;
      const proteinG = protIdx >= 0 && cols[protIdx] ? parseInt(cols[protIdx]) || null : null;
      const carbsG = carbsIdx >= 0 && cols[carbsIdx] ? parseInt(cols[carbsIdx]) || null : null;
      const fatG = fatIdx >= 0 && cols[fatIdx] ? parseInt(cols[fatIdx]) || null : null;
      const portionSize = portionIdx >= 0 && cols[portionIdx] ? cols[portionIdx] || null : null;

      // Parse tags (multiple comma-separated in one column, or remaining columns)
      let tags: string[] = [];
      if (tagsIdx >= 0) {
        tags = cols[tagsIdx]
          ? cols[tagsIdx].split(",").map((t) => t.trim()).filter(Boolean)
          : [];
      }

      // Validate
      if (!name) errors.push("Nombre requerido");
      if (name.length > 100) errors.push("Nombre muy largo (>100)");
      if (!description) errors.push("Descripción requerida");
      else if (description.length > 500) errors.push("Descripción muy larga (>500)");
      if (isNaN(price) || price <= 0) errors.push("Precio inválido");

      meals.push({
        row,
        name,
        description,
        price: isNaN(price) ? 0 : price,
        calories,
        proteinG,
        carbsG,
        fatG,
        portionSize,
        dietaryTags: tags,
        errors,
      });
    }

    setParsedMeals(meals);
    setResult(null);
  };

  const validMeals = parsedMeals.filter((m) => m.errors.length === 0);
  const hasErrors = parsedMeals.some((m) => m.errors.length > 0);

  const handleImport = async () => {
    if (validMeals.length === 0) return;
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/meals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          validMeals.map((m) => ({
            name: m.name,
            description: m.description,
            price: m.price,
            portionSize: m.portionSize || null,
            calories: m.calories,
            proteinG: m.proteinG,
            carbsG: m.carbsG,
            fatG: m.fatG,
            dietaryTags: m.dietaryTags.length > 0 ? m.dietaryTags : undefined,
          }))
        ),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al importar");
      }

      const data = await res.json();
      setResult({ success: true, message: data.message });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : "Error al importar platillos",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-platillos.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasData = parsedMeals.length > 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-lt-cream-dark px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-lt-warm-brown">
                Importación Masiva
              </h2>
              <p className="text-sm text-lt-charcoal/60">
                Pega datos desde una hoja de cálculo (CSV)
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Example + paste area */}
            {!hasData && (
              <>
                <div className="rounded-xl border border-lt-green/20 bg-lt-green/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-lt-olive-dark">
                    Formato esperado
                  </p>
                  <p className="mt-1 text-xs text-lt-charcoal/60">
                    Copia desde tu hoja de cálculo o escribe en formato CSV. Las columnas requeridas son{" "}
                    <strong>name</strong> y <strong>price</strong>.
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-white/80 p-3 text-[11px] leading-relaxed text-lt-charcoal/70">
                    {EXAMPLE_CSV}
                  </pre>
                  <button
                    onClick={handleDownloadTemplate}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-lt-green/20 bg-white/60 px-3 py-1.5 text-[11px] font-medium text-lt-olive-dark transition-all hover:bg-white hover:shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar plantilla CSV
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-lt-charcoal/70">
                    Pega tus datos aquí
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={10}
                    className="mt-1.5 w-full rounded-xl border border-lt-cream-dark bg-white p-4 font-mono text-sm outline-none transition-colors focus:border-lt-terracotta/50 focus:ring-2 focus:ring-lt-terracotta/10"
                    placeholder={`Pega aquí los datos copiados de tu hoja de cálculo...\n\nEjemplo:\nname,description,price,calories,protein,carbs,fat,portion,tags\nPollo Teriyaki,Arroz con vegetales y pollo,3500,500,30,45,12,400g,high-protein`}
                  />
                </div>

                <button
                  onClick={parseCSV}
                  disabled={!rawText.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-lt-terracotta py-3 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
                >
                  <FileText className="h-4 w-4" />
                  Previsualizar Datos
                </button>
              </>
            )}

            {/* Preview table */}
            {hasData && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-lt-charcoal/70">
                      {parsedMeals.length} platillo{parsedMeals.length !== 1 ? "s" : ""} detectados
                    </span>
                    {hasErrors && (
                      <span className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {parsedMeals.length - validMeals.length} con errores
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-lt-green">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {validMeals.length} válidos
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setParsedMeals([]);
                      setResult(null);
                    }}
                    className="text-sm text-lt-charcoal/50 hover:text-lt-terracotta"
                  >
                    Volver a editar
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-lt-cream-dark">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-lt-cream-dark bg-gray-50/50">
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">#</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">Nombre</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">Precio</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">Cal</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">Prot</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">Tags</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-lt-charcoal/50">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-lt-cream-dark">
                      {parsedMeals.map((meal) => (
                        <tr
                          key={meal.row}
                          className={`transition-colors ${
                            meal.errors.length > 0 ? "bg-red-50/50" : "hover:bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 py-3 text-xs text-lt-charcoal/40">{meal.row}</td>
                          <td className="px-4 py-3 font-medium text-lt-warm-brown">
                            <div className="max-w-[200px] truncate">{meal.name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-lt-terracotta">
                            ₡{meal.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs text-lt-charcoal/60">
                            {meal.calories ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-lt-charcoal/60">
                            {meal.proteinG ?? "—"}g
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {meal.dietaryTags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex rounded-full bg-lt-green/8 px-2 py-0.5 text-[10px] font-medium text-lt-olive-dark"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {meal.errors.length > 0 ? (
                              <div className="flex items-center gap-1 text-xs text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                <span>{meal.errors[0]}</span>
                              </div>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-lt-green">
                                <CheckCircle className="h-3 w-3" />
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Result message */}
                {result && (
                  <div
                    className={`rounded-xl border p-4 text-sm ${
                      result.success
                        ? "border-lt-green/20 bg-lt-green/5 text-lt-green"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {result.message}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setParsedMeals([]);
                      setResult(null);
                    }}
                    className="rounded-xl border border-lt-cream-dark px-5 py-2.5 text-sm font-medium text-lt-charcoal/70 transition-all hover:bg-gray-50"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={validMeals.length === 0 || isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-lt-terracotta px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-lt-terracotta-dark disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {isSubmitting
                      ? "Importando..."
                      : `Importar ${validMeals.length} platillo${validMeals.length !== 1 ? "s" : ""}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
