import re

with open('src/pages/admin/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add byRegion to state
content = content.replace(
    'const [monthlyStats, setMonthlyStats] = useState(MONTHLY_DATA_KEYS);',
    'const [monthlyStats, setMonthlyStats] = useState(MONTHLY_DATA_KEYS);\n  const [regionStats, setRegionStats] = useState<{region: string, count: number}[]>([]);'
)

# Update data population
set_stats_old = '''        if (data.monthly_applications && data.monthly_applications.length > 0) {
          setMonthlyStats(data.monthly_applications);
        }'''

set_stats_new = '''        if (data.monthly_applications && data.monthly_applications.length > 0) {
          setMonthlyStats(data.monthly_applications);
        }
        if (data.by_region) {
          setRegionStats(data.by_region.map((r: any) => ({ region: r.region || 'Boshqa', count: r.count })));
        }'''

content = content.replace(set_stats_old, set_stats_new)

# Add Regions chart UI
chart_old = '''        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.statusChartTitle')}</h3>
          <ResponsiveContainer width="100%" height={180}>'''

chart_new = '''        <Card className="lg:col-span-3 p-6 mt-6">
          <h3 className="font-bold text-slate-800 mb-6">Viloyatlar bo'yicha ishtirokchilar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={regionStats} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="region" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.statusChartTitle')}</h3>
          <ResponsiveContainer width="100%" height={180}>'''

content = content.replace(chart_old, chart_new)

with open('src/pages/admin/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
