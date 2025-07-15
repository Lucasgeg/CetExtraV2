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
          <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
);
