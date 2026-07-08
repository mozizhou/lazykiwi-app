import ImageGeneratorWorkbench from '../components/workbench/ImageGeneratorWorkbench';

export default function ImageGenerator({ routeMode, routeTemplate }) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ImageGeneratorWorkbench routeMode={routeMode} routeTemplate={routeTemplate} />
    </div>
  );
}
