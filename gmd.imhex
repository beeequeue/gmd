import std.io;
import std.mem;

struct StringEntry {
    char text[];
};

struct Header {
    char magic[4];
    u32 version;
    u32 language;
    padding[8]; // unknown (flags?)
    u32 labelCount;
    u32 sectionCount;
    u32 labelSize;
    u32 sectionSize;
    u32 nameSize;
};

struct MDHeader {
    s32 index;
    u32 hash1;
    u32 hash2;
    s32 offset;
    s32 unknown;
};

struct BucketList {
    if (header.labelCount > 0) {
        u32 buckets[0x100];
    }
};

Header header @ 0x00;
char name[header.nameSize + 1] @ $;

MDHeader mdHeaders[header.labelCount] @ $;
BucketList bl @ $;

StringEntry texts[header.sectionCount] @ $;
