import re

with open('src/pages/admin/DashboardPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix layout
old_layout = '''      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.monthlyChartTitle')}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyStats} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={(v) => [v as number, t('nav.applications')]}
              />
              <Bar dataKey="arizalar" fill="#1a56db" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-3 p-6 mt-6">
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
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.statusChartTitle')}</h3>'''

new_layout = '''      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.monthlyChartTitle')}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyStats} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }}
                formatter={(v) => [v as number, t('nav.applications')]}
              />
              <Bar dataKey="arizalar" fill="#1a56db" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6">{t('dash.statusChartTitle')}</h3>'''

content = content.replace(old_layout, new_layout)

chart_end = '''          <div className="space-y-2 mt-4">
            {PIE_DATA.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-600">{name}</span>
                </div>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>'''

regions_chart = '''          <div className="space-y-2 mt-4">
            {PIE_DATA.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-slate-600">{name}</span>
                </div>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-slate-800 mb-6">Viloyatlar va Davlatlar bo'yicha ishtirokchilar</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionStats} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="region" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>'''

content = content.replace(chart_end, regions_chart)

with open('src/pages/admin/DashboardPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
