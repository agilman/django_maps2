# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-05-07 01:38
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0002_auto_20170202_0028'),
    ]

    operations = [
        migrations.CreateModel(
            name='Album',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=32)),
                ('adv', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='albums', to='maps.Adventure')),
                ('advMap', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='maps.Map')),
            ],
        ),
        migrations.CreateModel(
            name='Picture',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('caption', models.CharField(max_length=512)),
                ('filename', models.CharField(max_length=12)),
                ('album', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='maps.Album')),
            ],
        ),
    ]
