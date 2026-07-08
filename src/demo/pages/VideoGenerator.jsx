import VideoGeneratorWorkbench from '../components/workbench/VideoGeneratorWorkbench';
import { WorkbenchHero, WorkbenchPage } from '../components/workbench/primitives.jsx';

/**
 * VideoGenerator page
 *
 * Thin shell that mounts the VideoGeneratorWorkbench inside the standard
 * WorkbenchPage + WorkbenchHero layout containers. All generation logic
 * and state lives inside the workbench and its children.
 */
export default function VideoGenerator({ routeMode, routeTemplate }) {
  return (
    <WorkbenchPage className="h-full flex flex-col">
      <WorkbenchHero>
        <VideoGeneratorWorkbench routeMode={routeMode} routeTemplate={routeTemplate} />
      </WorkbenchHero>
    </WorkbenchPage>
  );
}
