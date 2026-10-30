// swift pdf2png.swift in.pdf out.png widthPx — рендер першої сторінки PDF/AI (вектор) у PNG заданої ширини, білий фон
import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let a = CommandLine.arguments
guard a.count >= 4, let doc = CGPDFDocument(URL(fileURLWithPath: a[1]) as CFURL), let page = doc.page(at: 1) else { print("bad pdf"); exit(1) }
let box = page.getBoxRect(.trimBox).isEmpty ? page.getBoxRect(.mediaBox) : page.getBoxRect(.trimBox)
let media = page.getBoxRect(.mediaBox), art = page.getBoxRect(.artBox), crop = page.getBoxRect(.cropBox)
print("media \(media) crop \(crop) trim \(page.getBoxRect(.trimBox)) art \(art)")
let W = Int(a[3])!, scale = CGFloat(W) / box.width, H = Int((box.height * scale).rounded())
let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1)); ctx.fill(CGRect(x: 0, y: 0, width: W, height: H))
ctx.interpolationQuality = .high; ctx.setShouldAntialias(true)
ctx.scaleBy(x: scale, y: scale); ctx.translateBy(x: -box.minX, y: -box.minY)
ctx.drawPDFPage(page)
let img = ctx.makeImage()!
let dst = CGImageDestinationCreateWithURL(URL(fileURLWithPath: a[2]) as CFURL, UTType.png.identifier as CFString, 1, nil)!
CGImageDestinationAddImage(dst, img, nil); CGImageDestinationFinalize(dst)
print("ok \(W)x\(H)")
