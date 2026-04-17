import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import EcourtsCasePanel from '../../components/e-courts/EcourtsCasePanel';

export default function EcourtsCaseView() {
  const { cnr } = useParams();
  const clean = decodeURIComponent(cnr || '').trim();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <Header title="eCourts case" showBack />
      <EcourtsCasePanel cnr={clean} embedded={false} />
    </div>
  );
}
