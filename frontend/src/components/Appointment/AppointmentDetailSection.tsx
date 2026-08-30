type DetailItem = {
  label: string;
  value: string;
  strong?: boolean;
};

type AppointmentDetailSectionProps = {
  title: string;
  items: DetailItem[];
};

const AppointmentDetailSection = ({
  title,
  items,
}: AppointmentDetailSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.label}>
            <div className="text-xs text-gray-700">{item.label}</div>
            <div
              className={
                item.strong
                  ? "text-gray-900 font-semibold"
                  : "text-gray-900 font-medium"
              }
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentDetailSection;
