import dynamic from "next/dynamic";

export const MapWithUserFilter = dynamic(
  () =>
    import("./MapWithUserFilter").then((mod) => ({
      default: mod.MapWithUserFilter
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-blue-600 border-b-2"></div>
          <p className="text-gray-600 text-sm">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
);
