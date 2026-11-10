import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const SimpleBarChart = ({ data }) => {
  return (
    <section className="sales-chart-section">
      <h2>Drinks sold</h2>
      {data.length ? (
        <BarChart
          style={{
            width: "100%",
            maxWidth: "900px",
            height: Math.max(260, data.length * 52),
            margin: "0 auto",
          }}
          responsive
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 12, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar
            dataKey="quantitySold"
            name="Quantity sold"
            fill="#718f68"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      ) : (
        <p>No drinks to report yet.</p>
      )}
    </section>
  );
};

export default SimpleBarChart;
