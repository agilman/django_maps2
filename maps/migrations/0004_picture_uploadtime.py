# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-05-07 22:50
from __future__ import unicode_literals

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0003_album_picture'),
    ]

    operations = [
        migrations.AddField(
            model_name='picture',
            name='uploadTime',
            field=models.DateTimeField(default=datetime.datetime(2017, 5, 7, 22, 50, 5, 766932)),
            preserve_default=False,
        ),
    ]