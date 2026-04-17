import { Link, useParams } from 'react-router-dom';
import EcourtsCasePanel from '../../components/e-courts/EcourtsCasePanel';

export default function EcourtsCaseView() {
  const { cnr } = useParams();
  const clean = decodeURIComponent(cnr || '').trim();

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/cases/ecourts" className="btn-secondary text-xs py-1.5 px-3">
          ← eCourts hub
        </Link>
        <Link to="/cases" className="text-xs text-navy-700 font-medium hover:underline">
          All cases
        </Link>
      </div>
      <EcourtsCasePanel cnr={clean} embedded={false} />
    </div>
  );
}
