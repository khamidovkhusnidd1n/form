from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('events', '0004_event_format')]
    operations = [migrations.CreateModel(
        name='EventPartner',
        fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('name', models.CharField(max_length=255)),
            ('logo', models.ImageField(upload_to='events/partners/')),
            ('order', models.PositiveSmallIntegerField(default=0)),
            ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partners', to='events.event')),
        ],
        options={'ordering': ['order', 'id']},
    )]
