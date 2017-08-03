from maps.models import *
from maps.serializers import *
from maps.forms import ProfilePhotoUploadForm, AlbumPhotoUploadForm

from django.http import JsonResponse
from collections import OrderedDict

from django.contrib.auth.models import User

from rest_framework.parsers import JSONParser
from django.views.decorators.csrf import csrf_exempt

from django_maps2 import settings

from datetime import datetime

import pytz
import os

import PIL
from PIL import Image
from PIL.ExifTags import TAGS

@csrf_exempt
def userInfo(request,userId=None):
    if request.method == 'GET':
        adventures = Adventure.objects.filter(owner_id=userId)
        advSerializer = AdventureSerializer(adventures,many=True)
        
        bio = UserBio.objects.filter(user=userId).first()
        bioSerializer = None
    
        if type(bio)!=type(None):
            bioSerializer = UserBioSerializer(bio,many=False).data
            
        userPicture = UserProfilePicture.objects.filter(user=userId)
        userPicData = None
        if type(bio)!=type(None):
            bioSerializer = UserBioSerializer(bio,many=False).data
            
            userPicture = UserProfilePicture.objects.filter(user=userId)
            userPicData = None
            
        if type(userPicture)!=type(None):
            userPicData = UserProfilePictureSerializer(userPicture,many=True).data
            
        total = {"adventures":advSerializer.data,"bio":bioSerializer,"profile_pictures":userPicData}
        return JsonResponse(total, safe=False)

    elif request.method == 'POST': #NO PUT,Only POST
        data = JSONParser().parse(request)
        user = User.objects.get(pk=int(data["userId"]))
        
        #check if exists:
        bioQuery = UserBio.objects.filter(user=user)
        bio = None
        if bioQuery.exists():
            bioQuery.update(bio=data["bio"])
        
            bio = bioQuery.first()
        
        else:
            
            bio = UserBio(user=user,bio=data["bio"])
            bio.save()
        
        serialized = UserBioSerializer(bio)
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt
def adventures(request,advId=None):
    if request.method == 'POST':
        data = JSONParser().parse(request)

        #TODO: VALIDATION
        user = User.objects.get(pk=int(data["owner"]))
        
        advName = data["name"]
        advType = data["advType"]
        advStatus = data["advStatus"]
        
        #If advStatus = active, need to unset previous active.
        
        adv = Adventure(name=advName,owner=user,advType=advType,advStatus=advStatus)
        adv.save()

        serialized = AdventureSerializer(adv)
        return JsonResponse(serialized.data,safe=False)

    elif request.method == "DELETE":
        advToDel = Adventure.objects.get(pk=advId)
        advToDel.delete()
        serialized = AdventureSerializer(advToDel)
        
        #TODO Probably should return success code instead of object...
        return JsonResponse([],safe=False)
    
    elif request.method == "PUT":
        data = JSONParser().parse(request)
        owner = User.objects.get(pk=int(data["owner"]))
        
        advName = data["name"]
        advType = data["advType"]
        advStatus = data["advStatus"]
        
        #If advStatus = active, need to unset previous active.
        
        adv = Adventure(id=advId,name=advName,owner=owner,advType=advType,advStatus=advStatus)
        adv.save()
        
        serialized = AdventureSerializer(adv)
    return JsonResponse(serialized.data,safe=False)


@csrf_exempt
def advsOverview(request,userId):
    """This returns all start and end points from all the segments in all the maps, for all adventures.
    The goal is to visualize roughly all the travelling the user has done."""
    
    if request.method=="GET":
        allAdvs = []
        #this is awful
        advs = Adventure.objects.filter(owner_id=userId).all()
        for adv in advs:
            advCoordinates = []
            distance = 0
            startTime = None
            endTime = None

            #get startTime
            advMaps = adv.maps.all()
            if advMaps.count()>0:
                startSegments = advMaps[0].segments.all()
                endSegments=[]
                if startSegments.count()>0:
                    startTime = startSegments[0].startTime
                    endSegments = advMaps[advMaps.count()-1].segments.all()
                if endSegments.count()>0:
                    endTime = endSegments[endSegments.count()-1].endTime

                    
            for advMap in advMaps:
                segments = advMap.segments.all()
                for segment in segments:
                    start = segment.coordinates.first()
                    startPoint = [float(start.lat),float(start.lng)]
                    
                    end = segment.coordinates.last()
                    endPoint = [float(end.lat),float(end.lng)]

                    ###TODO: allow for non-continuous lines?
                    #Add first segment
                    if len(advCoordinates) == 0:
                        advCoordinates.append(startPoint)
                        advCoordinates.append(endPoint)

                        #If this is not the first segment, check if startPoint is same as last endPoint
                    else:
                        if advCoordinates[len(advCoordinates)-1]==startPoint:
                            advCoordinates.append(endPoint)
                        else:
                            advCoordinates.append(startPoint)
                            advCoordinates.append(endPoint)
                            
                    distance += segment.distance
                            
            advGeoJson = {'type':'Feature',
                          'properties':{'advId':adv.id,
                                        'distance': distance,
                                        'startTime': startTime,
                                        'endTime': endTime,
                                        'status': adv.advStatus},
                          'geometry':{'type':'LineString',
                                      'coordinates': advCoordinates}}
            
            allAdvs.append(advGeoJson)          
            
        adventuresGeoJson = {'type':'FeatureCollection','properties':{'userId':userId},'features': allAdvs}
            
        return JsonResponse(adventuresGeoJson, safe=False)



@csrf_exempt
def mapsOverview(request,advId):
    if request.method=="GET":
        adv = Adventure.objects.get(id=advId)
        
        advCoordinates = []
        distance = 0
        startTime = None
        endTime = None

        #get startTime
        advMaps = adv.maps.all()
        if advMaps.count()>0:
            startSegments = advMaps[0].segments.all()
            if startSegments.count()>0:
                startTime = startSegments[0].startTime
                endSegments = advMaps[advMaps.count()-1].segments.all()
            if endSegments.count()>0:
                endTime = endSegments[endSegments.count()-1].endTime

        results =[] 
                    
        for advMap in advMaps:
            segments = advMap.segments.all()
            for segment in segments:
                start = segment.coordinates.first()
                startPoint = [float(start.lat),float(start.lng)]
                    
                end = segment.coordinates.last()
                endPoint = [float(end.lat),float(end.lng)]

                ###TODO: allow for non-continuous lines?
                #Add first segment
                if len(advCoordinates) == 0:
                    advCoordinates.append(startPoint)
                    advCoordinates.append(endPoint)

                #If this is not the first segment, check if startPoint is same as last endPoint
                else:
                    if advCoordinates[len(advCoordinates)-1]==startPoint:
                        advCoordinates.append(endPoint)
                    else:
                        advCoordinates.append(startPoint)
                        advCoordinates.append(endPoint)
                            
                distance += segment.distance

            mapGeoJson = {'type':'Feature',
                      'properties':{'mapId':advMap.id,
                                    'mapName': advMap.name,
                                    'distance': distance,
                                    'startTime': startTime,
                                    'endTime': endTime},
                      'geometry':{'type':'LineString',
                                      'coordinates': advCoordinates}}
            
            results.append(mapGeoJson)          
            
        adventuresGeoJson = {'type':'FeatureCollection','properties':{'advId':advId},'features': results}
            
        return JsonResponse(adventuresGeoJson, safe=False)
    
                        
def handle_uploaded_profilePhoto(userId,f):
    #write file as is, convert to decided format, add to db,  delete old ?
    
    #save file as is
    target = settings.USER_MEDIA_ROOT+'/'+str(userId)+'/profile_pictures/'+f.name
    
    with open(target, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
            
    #convert,resize,thumbs

    #add to db
    user = User.objects.get(pk=int(userId))
    my_date = datetime.now(pytz.timezone('US/Pacific'))
    profilePicture = UserProfilePicture(user=user,uploadTime=my_date,active=True)
    profilePicture.save()
    
    #temp solution... need to convert to target file with right extension, and then delete the old file.
    #rename
    newName = settings.USER_MEDIA_ROOT+'/'+str(userId)+'/profile_pictures/'+str(profilePicture.id)+".png"
    os.rename(target,newName)

    
    return profilePicture

@csrf_exempt
def pictures(request,albumId=None):
    if request.method == 'POST':
        form = AlbumPhotoUploadForm(request.POST,request.FILES)
        if form.is_valid():
            f = request.FILES['file']

            userId= request.user.id
            
            pic = handle_uploaded_albumPhoto(userId,albumId,f)
            serialized = PictureSerializer(pic)
            
            return JsonResponse(serialized.data,safe=False)
        else:
            return JsonResponse({"msg":"FAIL"},safe=False)

    if request.method == 'GET':
        album = Album.objects.get(id=albumId)
        pics = Picture.objects.filter(album=album).all()

        serialized = PictureSerializer(pics,many=True)
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt
def advPictures(request,advId=None):
    if request.method == 'GET':
        adv = Adventure.objects.get(id = advId)
        albums = list(Album.objects.filter(adv=adv).values_list('id',flat=True))

        pics = Picture.objects.filter(album__in=albums).all()

        serialized = PictureSerializer(pics,many=True)
        return JsonResponse(serialized.data,safe=False)
        
@csrf_exempt
def deletePictures(request,albumId=None):  #This is used to bulk delete pictures.
    if request.method == 'POST':
        data = JSONParser().parse(request)
        
        deleted = []
        for picId in data:
            pic = Picture.objects.get(id=picId)
            pic.delete()

            #delete pic from disk
            settings.USER_MEDIA_ROOT
            path = settings.USER_MEDIA_ROOT+"/"+str(request.user.pk)+"/"+str(albumId)+"/"+pic.filename
            thpath = settings.USER_MEDIA_ROOT+"/"+str(request.user.pk)+"/"+str(albumId)+"/.th/"+pic.filename
            mipath = settings.USER_MEDIA_ROOT+"/"+str(request.user.pk)+"/"+str(albumId)+"/.mi/"+pic.filename
            
            os.remove(path)
            os.remove(thpath)
            os.remove(mipath)                                                                                    
            
            #check for success? only push on succes...
            deleted.append(picId)
            
        return JsonResponse(deleted,safe=False)


@csrf_exempt
def geotagPictures(request):  #This is used to bulk delete pictures.
    if request.method == 'POST':
        data = JSONParser().parse(request)
        pictures = data["pictures"]
        point = data['tag']

        results = []
        for i in pictures:
            #create pic meta
            pic = Picture.objects.get(id=i)

            metaQuery  = PicMeta.objects.filter(picture=pic)
            #Check if meta object already exists -> update if exists, create new one otherwise
            
            if metaQuery.exists():
                metaQuery.update(lat=point['lat'],lng=point['lng'])
                
                serialized = PicMetaSerializer(metaQuery.first())
                results.append(serialized.data)

            else:
                newMeta = PicMeta(picture = pic, lat=point['lat'], lng=point['lng'])
                newMeta.save()
                
                serialized = PicMetaSerializer(newMeta)
                results.append(serialized.data)
        
        return JsonResponse(results,safe=False)

        
@csrf_exempt
def profilePhoto(request):
    if request.method == 'POST':
        
        form = ProfilePhotoUploadForm(request.POST,request.FILES)
        if form.is_valid():
            userId = form.data['userId']
            f = request.FILES['file']
            userPic = handle_uploaded_profilePhoto(userId,f)
            
            return JsonResponse({"picId":userPic.id},safe=False)
        else:
            return JsonResponse({"msg":"FAIL"},safe=False)

@csrf_exempt
def advMaps(request,advId=None):
    """Used to get list of maps, no coordinates"""
    if request.method == 'GET':
        queryset = Map.objects.filter(adv=advId)
        results = []
        # TODO Write a serializer...
        for i in queryset.all():
            myMap = {"id":i.id,"name":i.name,"distance":i.total_distance()}
            results.append(myMap)
            
        return JsonResponse(results,safe=False)

    if request.method == 'POST':
        data = JSONParser().parse(request)
        adv = Adventure.objects.get(id=int(data["advId"]))
        map = Map(name=data["name"],adv=adv)
        
        map.save()

        #Side effect of creating a map: album created with same name, folder created with albumId.
        album = Album(adv = adv, advMap=map, title=data["name"])
        album.save()

        #create dir..
        createAlbumDirs(request.user.id,album.id)

        
        #Hmm, maybe I should just get a serializer...
        result = {"id":map.id,"name":map.name,"features":[],"distance":0 }
        return JsonResponse(result,safe=False)

    

def createAlbumDirs(userId,newAlbumId):
    #create album directory
    media_root = settings.USER_MEDIA_ROOT
    
    #create path for all the albums for given user... this should probably be done when user account is created?
    #THIS SHOULD NOT BE DONE HERE.
    if not os.path.exists(media_root +"/"+ str(userId)):
        os.mkdir(media_root + "/" + str(userId))
        
    albumPath = media_root + "/" + str(userId) + "/" + str(newAlbumId)
    
    if not os.path.exists(albumPath):
        os.mkdir(albumPath)
        os.mkdir(albumPath+"/.th") #make dir for thumbs
        os.mkdir(albumPath+"/.mi") #make dir for midsize image  
            
@csrf_exempt
def map(request,mapId=None):
    """Used to get map segments """
    if request.method == 'GET':        
        map = Map.objects.filter(id=mapId).first()
        
        results = []
        if map!=None:
            results = makeGeoJsonFromMap(map)
            return JsonResponse(results,safe=False)

    elif request.method == 'DELETE':
        mapToDel = Map.objects.get(id=mapId)
        mapToDel.delete()
        
        serialized = MapSerializer(mapToDel)
        
        return JsonResponse(serialized.data,safe=False)

@csrf_exempt
def advMapSegments(request,advId=None):
    """Used to get all map segments for entire adventure"""
    if request.method=='GET':
        adv = Adventure.objects.get(id = advId)
        maps = Map.objects.filter(adv = adv).all()

        results = [] 
        for m in maps:
            geoJson = makeGeoJsonFromMap(m)
            results.append(geoJson)

        return JsonResponse(results,safe=False)    
    
def makeGeoJsonFromMap(map):
    features = []

    for segment in map.segments.all():

        coordinates = []
        for coord in segment.coordinates.all():
            coordinates.append([float(coord.lat),float(coord.lng)])
                
        geometry = {"type":"LineString","coordinates":coordinates}

        notesResults = segment.dayNotes.first()
        notes = []
        if type(notesResults)!=type(None):
            note = notesResults.note
            notes.append(note)

        segmentDict = {"type":"Feature",
                       "properties": {"segmentId":segment.id,
                                      'distance':segment.distance,
                                      'startTime':segment.startTime,
                                      'endTime':segment.endTime,
                                      'delay': segment.delay,
                                      'notes':notes},
                       "geometry":geometry}
        features.append(segmentDict)

    mapDict = {"type":"FeatureCollection","properties":{"mapId": map.id,"mapName":map.name},"features":features}
        
    return mapDict

#TODO : Use  makeGeoJsonFromSegment inside makeGeoJsonFromMap...
def makeGeoJsonFromSegment(segment):
    coordinates = []
    for coord in segment.coordinates.all():
        coordinates.append([float(coord.lat),float(coord.lng)])
    
    geometry = {"type":"LineString","coordinates":coordinates}
    notes = []
    for notesObj in segment.dayNotes.all():
        notes.append(notesObj.note)
        
    feature = {"type":"Feature",
               "properties":{"segmentId": segment.id,
                             "distance": segment.distance,
                             "delay": segment.delay,
                             "notes": notes,
                             'startTime':segment.startTime,
                             'endTime':segment.endTime},
               "geometry":geometry}
    
    return feature

@csrf_exempt
def mapSegment(request,segmentId=None):
    if request.method=='POST':
        data = JSONParser().parse(request)
        #Try validation with serializers...

        if "mapId" in data.keys() and data["mapId"] is not None:
            map = Map.objects.get(id=int(data["mapId"]))
            
            startTime  = None
            endTime = None
            dayNotes = None
            if "startTime" in data.keys():
                startTime = data["startTime"]
            if "endTime" in data.keys():
                endTime = data["endTime"]
                
            distance = data["distance"]
            waypoints = data["waypoints"]

            if 'dayNotes' in data.keys():
                dayNotes = data['dayNotes']
                
            delay = data['delay']
                
            #create segment
            mapSegment = MapSegment(map=map,
                                        startTime=startTime,
                                        endTime=endTime,
                                        distance = distance,
                                        delay=delay)
                
            mapSegment.save()
            if dayNotes:
                dayNoteObj = DayNote(segment = mapSegment,note = dayNotes)
                dayNoteObj.save()
                    
            #create waypoints
            for point in waypoints:
                waypointObj = WayPoint(segment = mapSegment, lat = point[1], lng = point[0])
                waypointObj.save()

            #return custom geoJson
            result = makeGeoJsonFromSegment(mapSegment)

            return JsonResponse(result,safe=False)
        else:
            return JsonResponse({"error":"Bad input"})
                            

                    
@csrf_exempt
def advAlbums(request,advId=None):
    """Used to get list of maps, no coordinates"""
    if request.method == 'GET':
        adv = Adventure.objects.get(id=advId)
        albums = Album.objects.filter(adv=adv)
        albumSerializer = AlbumSerializer(albums, many=True)
        return JsonResponse(albumSerializer.data, safe=False)

def rotateImage(imgPath):
    im = Image.open(imgPath)
    
    srev = imgPath[::-1]
    ext = imgPath[len(srev)-srev.index("."):]
    
    if ext=="jpg" or ext=="jpeg":
        toRotate = True
        exifdict = im._getexif()
        if exifdict:
            for k in exifdict.keys():
                if k in TAGS.keys():
                    if TAGS[k]=="Orientation":
                        orientation = exifdict[k]
                        if orientation == 3:
                            im = im.rotate(180, expand=True)
                        elif orientation == 6:
                            im = im.rotate(270, expand=True)
                        elif orientation == 8:
                            im = im.rotate(90, expand=True)
                        else:
                            toRotate = False
                            
        if toRotate:
            im.save(imgPath)

def resizeImage(path,fileName,targetPath,targetName,targetWidth,targetHeight):
    """ Strategy:
    -if picture is horizontal: resize to desired height, crop the center -- removing pixels from left and right.
    -if picture is vertical: resize to desired width, crop the center --removing pixels from top and bottom."""
    
    inFile = path+fileName
    
    outFile = targetPath+targetName
        
    img = Image.open(inFile)
    imgWidth = img.size[0]
    imgHeight = img.size[1]

    if (imgHeight>imgWidth):
        wprecent = (float(targetWidth)/imgWidth)
        hsize = int(float(imgHeight)*wprecent)

        img = img.resize((targetWidth,hsize),PIL.Image.ANTIALIAS)
        voffset = ( hsize - targetHeight)/2
        box = (0,voffset,targetWidth,voffset+targetHeight)
            
        img = img.crop(box)
        img.save(outFile)

    else:
        #check ratios
        if (float(targetWidth)/float(targetHeight)>float(imgWidth)/float(imgHeight)):
            wprecent = (float(targetWidth)/imgWidth)
            hsize = int(float(imgHeight)*wprecent)

            img = img.resize((targetWidth,hsize),PIL.Image.ANTIALIAS)
            voffset = ( hsize - targetHeight)/2
            box = (0,voffset,targetWidth,voffset+targetHeight)
            
            img = img.crop(box)
            img.save(outFile)

        else:
            hprecent = (float(targetHeight)/imgHeight)
            wsize = int(float(imgWidth)*hprecent)

            img = img.resize((wsize,targetHeight),PIL.Image.ANTIALIAS)
            hoffset = ( wsize - targetWidth)/2
            box = (hoffset,0,hoffset+targetWidth,targetHeight)

            img = img.crop(box)
            img.save(outFile)

    return 1

def handle_uploaded_albumPhoto(userId,albumId,f):
    #write file as is, convert to decided format, add to db,  delete old ?
    
    #save file as is
    newName = f.name 
    filePath = settings.USER_MEDIA_ROOT+'/'+str(userId)+'/'+albumId+'/'
    target = filePath +  newName

    with open(target, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
            
    #TODO: generate new name, convert to compressed format..            
    #convert,resize,thumbs

    #rotate image if needed.
    rotateImage(target)

    #resizeImage(target)

    resizeImage(filePath,newName,filePath+".th/",newName,150, 100)

    ##make midzie picture
    resizeImage(filePath,newName,filePath+".mi/",newName,670,450)
                                        

    
    #Add to db
    album = Album.objects.get(id=int(albumId))
    now = datetime.now(pytz.timezone('US/Pacific'))
    picture = Picture(album=album,caption=None, filename=newName,uploadTime=now)
    picture.save()

    return picture

            
@csrf_exempt
def blogs(request,mapId=None,blogId=None):
    if request.method == 'POST':        
        data = JSONParser().parse(request)

        adv = Adventure.objects.get(id=data["adv"])
        map = Map.objects.get(id=mapId)
        title = data["title"]
        entry = data["entry"]
        now = datetime.now(pytz.timezone('US/Pacific'))
        
        newBlog = Blog(adv=adv,map=map,title=title,entry=entry,saveTime=now,status=1)
        newBlog.save()

        serialized = BlogSerializer(newBlog)
        
        return JsonResponse(serialized.data,safe=False)
    
    elif request.method == 'GET':
        if blogId==None:
            map = Map.objects.get(id=mapId)
            blogs = Blog.objects.filter(map=map).all()
            
            serialized = BlogSerializer(blogs,many=True)
            return JsonResponse(serialized.data,safe=False)
        else:
            blog = Blog.objects.get(id=blogId)
            serialized = BlogSerializer(blog)
            return JsonResponse(serialized.data,safe=False)

    elif request.method == 'DELETE':
        blogToDel = Blog.objects.get(id=blogId)
        
        blogToDel.delete()
        serialized = BlogSerializer(blogToDel)
        
        return JsonResponse(serialized.data,safe=False)
