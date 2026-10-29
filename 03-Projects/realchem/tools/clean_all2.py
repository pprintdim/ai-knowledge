import sys,numpy as np,cv2
S,OUT=sys.argv[1],sys.argv[2]
img=cv2.imread(S+'/glb/img0.jpg')
f=img.astype(np.int16); B_,G,R=f[...,0],f[...,1],f[...,2]
lum=(0.299*R+0.587*G+0.114*B_)
# 1) явний кольоровий друк (фіолетовий/синюватий), не темний — шнурки чорні, їх не чіпаємо
strong=((B_-R>12)&(lum<228)&(lum>70))
near=cv2.dilate(strong.astype(np.uint8),np.ones((41,41),np.uint8))>0
# 2) слабкий/темний друк (чорні літери «NANO TECHNOLOGY», краї) — лише поруч із кольоровим друком
dark=(lum<70).astype(np.uint8)
nc,lab,stats,_=cv2.connectedComponentsWithStats(dark,connectivity=8)
small=np.isin(lab,np.where(stats[:,cv2.CC_STAT_AREA]<500)[0][1:] if nc>1 else [])
tinted=((lum<185)&(lum>48)&(B_-R>3))  # сіро-синій друк — чистимо скрізь (шнурки захищені guard)
# захист шнурків: усе в радіусі 4px від великих темних клаптів (шнурки) — не друк
big=np.isin(lab,np.where(stats[:,cv2.CC_STAT_AREA]>=500)[0][1:] if nc>1 else [])
guard=cv2.dilate(big.astype(np.uint8),np.ones((9,9),np.uint8))>0
ink=(strong|tinted|(small&near))&~guard
ink=cv2.dilate(ink.astype(np.uint8)*255,np.ones((3,3),np.uint8),iterations=2)
ink[guard]=0
print('ink px', int((ink>0).sum()))
clean=cv2.inpaint(img,ink,6,cv2.INPAINT_TELEA)
# контроль: скільки темних пікселів (шнурки) змінилось
d=(lum<70); ch=np.abs(clean.astype(np.int16)-img.astype(np.int16)).max(-1)>40
print('dark px changed', int((d&ch).sum()), 'of', int(d.sum()))
cv2.imwrite(OUT,clean,[cv2.IMWRITE_JPEG_QUALITY,88])
cv2.imwrite(S+'/clean2-crop.jpg',clean[500:1300,600:1400])
nrm=cv2.imread(S+'/glb/img2.jpg')
inkw=cv2.dilate(ink,np.ones((3,3),np.uint8),iterations=2); inkw[guard]=0
nclean=cv2.inpaint(nrm,inkw,6,cv2.INPAINT_TELEA)
blur=cv2.GaussianBlur(nclean,(0,0),2); nclean[inkw>0]=blur[inkw>0]
cv2.imwrite(OUT.replace('bag-albedo.jpg','bag-normal.jpg'),nclean,[cv2.IMWRITE_JPEG_QUALITY,90])
