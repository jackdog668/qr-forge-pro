import struct, zlib

def make_png(size, path):
    bg = (10, 11, 13)
    grn = (64, 255, 120)
    sq = size // 3
    s0 = (size - sq) // 2
    pixels = []
    for y in range(size):
        row = []
        for x in range(size):
            if s0 <= x < s0 + sq and s0 <= y < s0 + sq:
                row.extend(grn)
            else:
                row.extend(bg)
        pixels.append(bytes(row))
    raw = b''.join(b'\x00' + r for r in pixels)
    def ch(t, d):
        c = t + d
        return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr = ch(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
    idat = ch(b'IDAT', zlib.compress(raw, 9))
    iend = ch(b'IEND', b'')
    png = b'\x89PNG\r\n\x1a\n' + ihdr + idat + iend
    with open(path, 'wb') as f:
        f.write(png)
    print(f'Created {path} ({len(png)} bytes)')

make_png(192, r'C:\Users\ulilj\Projects\qr-forge-pro\public\icon-192.png')
make_png(512, r'C:\Users\ulilj\Projects\qr-forge-pro\public\icon-512.png')
