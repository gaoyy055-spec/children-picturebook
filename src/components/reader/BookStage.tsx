import type { BookPage } from '../../types';
import HotspotComponent from './Hotspot';
import styles from './BookStage.module.css';

interface BookStageProps {
  page: BookPage;
  onHotspotClick: (hotspot: BookPage['hotspots'][0]) => void;
}

export default function BookStage({ page, onHotspotClick }: BookStageProps) {
  return (
    <div className={styles.stage}>
      <div className={styles.sceneWrap}>
        <div
          className={styles.scene}
          dangerouslySetInnerHTML={{ __html: page.sceneSvg }}
        />

        {/* 热区覆盖层 */}
        {page.hotspots.map((h) => (
          <HotspotComponent key={h.id} hotspot={h} onClick={onHotspotClick} />
        ))}
      </div>
    </div>
  );
}
