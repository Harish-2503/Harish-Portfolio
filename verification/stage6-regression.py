from stage6_verify import *
with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
    regression(b, NEW, "new d1280"); regression(b, BASE, "stage5 d1280")
    regression(b, NEW, "new m390", 390, 844, True); regression(b, BASE, "stage5 m390", 390, 844, True)
    b.close()
