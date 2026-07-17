interface DietaryTagBadgeProps {
  slug: string;
  name: string;
  emoji?: string | null;
}

export default function DietaryTagBadge({ slug, name, emoji }: DietaryTagBadgeProps) {
  const colorClass = getTagColorClass(slug);

  return (
    <span className={`lt-tag ${colorClass}`}>
      {emoji && <span>{emoji}</span>}
      {name}
    </span>
  );
}

function getTagColorClass(slug: string): string {
  const colorMap: Record<string, string> = {
    vegan: "lt-tag-vegan",
    vegetarian: "lt-tag-vegetarian",
    "gluten-free": "lt-tag-gluten-free",
    "sin-gluten": "lt-tag-gluten-free",
    keto: "lt-tag-keto",
    "high-protein": "lt-tag-high-protein",
    "alta-proteina": "lt-tag-high-protein",
    "low-carb": "lt-tag-low-carb",
    "bajos-carbohidratos": "lt-tag-low-carb",
    "dairy-free": "lt-tag-dairy-free",
    "sin-lacteos": "lt-tag-dairy-free",
    "sugar-free": "lt-tag-sugar-free",
    "sin-azucar": "lt-tag-sugar-free",
  };

  return colorMap[slug] || "bg-gray-100 text-gray-700";
}
