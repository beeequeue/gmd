import std.io;
import std.mem;

struct StringEntry {
    char text[];
};

struct Header {
    char magic[4];
    u32 version;
    u32 language;
    u8 unknownData[8]; // unknown (flags?)
    u32 keyCount;
    u32 sectionCount;
    u32 keyBlockSize;
    u32 sectionBlockSize;
    u32 filenameSize;
};

struct MDHeader {
    u32 index;
    s32 hash1;
    s32 hash2;
    u32 keyOffset;
    s32 bucketIndex;
};

struct BucketList {
    if (header.keyCount > 0) {
        u32 buckets[0x100];
    }
};

Header header @ 0x00;
char name[header.filenameSize + 1] @ $;

MDHeader mdHeaders[header.keyCount] @ $;
BucketList bl @ $;

StringEntry texts[header.sectionCount] @ $;
