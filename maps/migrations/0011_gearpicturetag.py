# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-12-19 15:27
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0010_auto_20170821_0158'),
    ]

    operations = [
        migrations.CreateModel(
            name='GearPictureTag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('x', models.FloatField()),
                ('y', models.FloatField()),
                ('text', models.CharField(max_length=32)),
                ('gearItem', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='maps.GearItem')),
                ('gearPic', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='maps.GearPicture')),
            ],
        ),
    ]
