# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-07-30 16:54
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0006_picmeta'),
    ]

    operations = [
        migrations.CreateModel(
            name='Blog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=128)),
                ('entry', models.CharField(max_length=4096)),
                ('saveTime', models.DateTimeField()),
                ('status', models.IntegerField()),
                ('adv', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='maps.Adventure')),
                ('map', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='maps.Map')),
            ],
        ),
    ]