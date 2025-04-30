import Image from 'next/image';

export default function AcercaDeCCH() {
  return (
    <div className="w-full py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8 md:flex-row">
          <div className="w-full md:w-1/2">
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
              <Image
                src="/images/about.jpg"
                alt="Trabajadores marítimos cargando mercancía"
                fill
                className="object-cover object-[center_80%]"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Acerca de CCH
              <br />
              Logistics Services
              <br />
              Group
            </h2>
            <p className="leading-relaxed text-gray-600 dark:text-white">
              En CCH Logistics Services Group, nos enorgullecemos de ser su socio estratégico en
              soluciones logísticas integrales, sirviendo eficientemente tanto en Venezuela como en
              Panamá. Con una profunda comprensión de las complejidades del transporte marítimo y de
              carga, nos dedicamos a optimizar sus operaciones y a garantizar el flujo constante de
              sus suministros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
