#include <iostream>

using namespace std;

#define eleType int

struct SequentialList {
    eleType *elements;
    int size{0};
    int capacity{0};
};

void initializeList(SequentialList *list, int capacity) {
    list->elements = NULL;
    list->elements = new eleType[capacity];
    list->size = 0;
    list->capacity = capacity;
}

void destroyList(SequentialList *list) {
    delete[] list->elements;
    list->elements = NULL;
}

int size(SequentialList *list) { return list->size; }

bool isEmpty(SequentialList *list) { return list->size == 0; }

void insert(SequentialList *list, int index, eleType element) {
    if (index < 0 || index > list->capacity)
        throw invalid_argument("Invaild Index!");
    if (list->capacity == list->size) {
        int newCapacity = list->capacity * 2;
        eleType *newElements = new eleType[newCapacity];
        for (int i = 0; i < list->size; ++i) {
            newElements[i] = list->elements[i];
        }
        delete[] list->elements;
        list->elements = newElements;
        list->capacity = newCapacity;
    }
    for (int i = list->size; i > index; --i) {
        list->elements[i] = list->elements[i - i];
    }
    list->elements[index] = element;
    ++list->size;
}

int main(void) { return 0; }
