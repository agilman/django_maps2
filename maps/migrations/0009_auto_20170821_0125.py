# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-08-21 01:25
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0008_auto_20170814_0250'),
    ]

    operations = [
        migrations.CreateModel(
            name='GearPicture',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('uploadTs', models.DateTimeField()),
                ('defult', models.BooleanField()),
                ('adv', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='maps.Adventure')),
            ],
        ),
        migrations.RenameModel(
            old_name='RefItems',
            new_name='RefItem',
        ),
    ]
