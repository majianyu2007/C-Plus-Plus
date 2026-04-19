// ============================================================================
// 数据结构模板 - 队列、栈、链表实现
// ============================================================================

#include <iostream>
#include <stdexcept>
#include <vector>

using namespace std;

// ============================================================================
// 1. 队列 (Queue) - 先进先出 (FIFO)
// ============================================================================
/*
 * 时间复杂度：
 * - enqueue: O(1) 摊销
 * - dequeue: O(1) 摊销
 * - getSize: O(1)
 * 
 * 空间复杂度：O(n)
 * 
 * 应用场景：
 * - 任务调度系统
 * - BFS 算法
 * - 消息队列
 * - 事件处理
 */

class Queue {
private:
    vector<int> element;
    size_t front;      // 首元素索引
    size_t rear;       // 下一个插入位置索引
    size_t capacity;   // 当前容量

public:
    // 构造函数
    Queue(size_t initialCapacity = 10)
        : front(0), rear(0), capacity(initialCapacity) {
        element.resize(capacity);
    }
    
    // 检查队列是否为空
    bool empty() const {
        return front == rear;
    }
    
    // 获取队列元素个数
    size_t getSize() const {
        return rear - front;
    }
    
    // 进队列：在尾部添加元素
    void enqueue(int value) {
        // 如果rear指针到达容量末尾
        if (rear >= capacity) {
            // 如果有已删除的空间，先整理
            if (front > 0) {
                size_t size = getSize();
                for (size_t i = 0; i < size; i++) {
                    element[i] = element[front + i];
                }
                rear = size;
                front = 0;
            }
        }
        
        // 如果仍然空间不足，容量翻倍
        if (rear >= capacity) {
            capacity *= 2;
            element.resize(capacity);
        }
        
        element[rear++] = value;
    }
    
    // 出队列：删除首元素并返回
    int dequeue() {
        if (empty()) {
            throw runtime_error("Queue is empty");
        }
        return element[front++];
    }
    
    // 获取首元素（不删除）
    int front_element() const {
        if (empty()) {
            throw runtime_error("Queue is empty");
        }
        return element[front];
    }
};


// ============================================================================
// 2. 栈 (Stack) - 后进先出 (LIFO)
// ============================================================================
/*
 * 时间复杂度：
 * - push: O(1) 摊销
 * - pop: O(1)
 * - top: O(1)
 * - getSize: O(1)
 * 
 * 应用场景：
 * - 括号匹配检查
 * - DFS 深度优先搜索
 * - 中缀表达式转后缀
 * - 函数调用栈
 * - 撤销/重做功能
 */

class Stack {
private:
    vector<int> element;
    size_t top_index;
    size_t capacity;

public:
    // 构造函数
    Stack(size_t initialCapacity = 10)
        : top_index(0), capacity(initialCapacity) {
        element.resize(capacity);
    }
    
    // 检查栈是否为空
    bool empty() const {
        return top_index == 0;
    }
    
    // 获取栈中元素个数
    size_t getSize() const {
        return top_index;
    }
    
    // 压栈：在顶部添加元素
    void push(int value) {
        if (top_index >= capacity) {
            capacity *= 2;
            element.resize(capacity);
        }
        element[top_index++] = value;
    }
    
    // 出栈：删除顶部元素并返回
    int pop() {
        if (empty()) {
            throw runtime_error("Stack is empty");
        }
        return element[--top_index];
    }
    
    // 获取顶部元素（不删除）
    int top() const {
        if (empty()) {
            throw runtime_error("Stack is empty");
        }
        return element[top_index - 1];
    }
    
    // 清空栈
    void clear() {
        top_index = 0;
    }
};


// ============================================================================
// 3. 链表节点与基础操作
// ============================================================================
/*
 * 节点结构：
 * - data: 存储的数据
 * - next: 指向下一个节点的指针
 * 
 * 优势：
 * - 动态分配内存，不需要预先知道大小
 * - 插入/删除操作不需要移动其他元素
 * 
 * 劣势：
 * - 访问速度慢 O(n)，无法随机访问
 * - 需要额外内存存储指针
 */

struct ListNode {
    int data;
    ListNode* next;
    
    ListNode(int val) : data(val), next(nullptr) {}
};

class LinkedList {
private:
    ListNode* head;
    size_t size;

public:
    // 构造函数
    LinkedList() : head(nullptr), size(0) {}
    
    // 析构函数：释放所有节点
    ~LinkedList() {
        clear();
    }
    
    // 禁用拷贝（防止指针问题）
    LinkedList(const LinkedList&) = delete;
    LinkedList& operator=(const LinkedList&) = delete;
    
    // 获取链表大小
    size_t getSize() const {
        return size;
    }
    
    // 检查链表是否为空
    bool empty() const {
        return size == 0;
    }
    
    // 在头部插入元素 O(1)
    void push_front(int value) {
        ListNode* newNode = new ListNode(value);
        newNode->next = head;
        head = newNode;
        size++;
    }
    
    // 在尾部插入元素 O(n)
    void push_back(int value) {
        ListNode* newNode = new ListNode(value);
        if (!head) {
            head = newNode;
        } else {
            ListNode* curr = head;
            while (curr->next) {
                curr = curr->next;
            }
            curr->next = newNode;
        }
        size++;
    }
    
    // 删除头部元素并返回 O(1)
    int pop_front() {
        if (!head) {
            throw runtime_error("List is empty");
        }
        ListNode* oldHead = head;
        int value = oldHead->data;
        head = head->next;
        delete oldHead;
        size--;
        return value;
    }
    
    // 获取指定位置的值 O(n)
    int get(size_t index) const {
        if (index >= size) {
            throw out_of_range("Index out of range");
        }
        ListNode* curr = head;
        for (size_t i = 0; i < index; i++) {
            curr = curr->next;
        }
        return curr->data;
    }
    
    // 清空链表
    void clear() {
        while (!empty()) {
            pop_front();
        }
    }
    
    // 打印链表
    void print(ostream& os = cout) const {
        ListNode* curr = head;
        os << "List: ";
        while (curr) {
            os << curr->data;
            if (curr->next) os << " -> ";
            curr = curr->next;
        }
        os << "\n";
    }
};


// ============================================================================
// 使用示例
// ============================================================================

/*
int main() {
    // 队列示例
    {
        cout << "=== Queue Demo ===\n";
        Queue q;
        q.enqueue(3);
        q.enqueue(2);
        q.enqueue(8);
        q.enqueue(6);
        cout << "Enqueue: 3, 2, 8, 6. Size: " << q.getSize() << "\n";
        
        q.enqueue(5);
        cout << "After enqueue(5): " << q.dequeue() << "\n";  // 输出 3
    }
    
    // 栈示例
    {
        cout << "\n=== Stack Demo ===\n";
        Stack s;
        s.push(1);
        s.push(2);
        s.push(3);
        cout << "Push 1, 2, 3. Top: " << s.top() << "\n";
        cout << "Pop: " << s.pop() << "\n";  // 输出 3
    }
    
    // 链表示例
    {
        cout << "\n=== LinkedList Demo ===\n";
        LinkedList list;
        list.push_front(1);
        list.push_back(2);
        list.push_back(3);
        list.print();
        cout << "Get(1): " << list.get(1) << "\n";
    }
    
    return 0;
}
*/
